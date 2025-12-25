from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import pymongo
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
import uuid
from datetime import datetime, timezone, timedelta
import qrcode
from io import BytesIO
import base64
import asyncio


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class FileMetadata(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    filename: str
    size: int
    mimetype: str
    upload_time: datetime
    expires_at: datetime

class UploadResponse(BaseModel):
    id: str
    filename: str
    size: int
    download_url: str
    qr_code: str
    expires_at: str


@api_router.get("/")
async def root():
    return {"message": "File Sharing API"}


@api_router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    try:
        # Check file size (max 50MB)
        contents = await file.read()
        file_size = len(contents)
        
        if file_size > 50 * 1024 * 1024:  # 50MB
            raise HTTPException(status_code=400, detail="File size exceeds 50MB limit")
        
        if file_size < 1:
            raise HTTPException(status_code=400, detail="File is empty")
        
        # Generate unique file ID
        file_id = str(uuid.uuid4())
        
        # Calculate expiration time (2 hours from now)
        upload_time = datetime.now(timezone.utc)
        expires_at = upload_time + timedelta(hours=2)
        
        # Store file in GridFS
        from gridfs import GridFS
        import pymongo
        sync_client = pymongo.MongoClient(mongo_url)
        sync_db = sync_client[os.environ['DB_NAME']]
        fs = GridFS(sync_db)
        
        fs.put(
            contents,
            _id=file_id,
            filename=file.filename,
            content_type=file.content_type
        )
        
        # Store metadata in collection
        metadata = {
            "id": file_id,
            "filename": file.filename,
            "size": file_size,
            "mimetype": file.content_type or "application/octet-stream",
            "upload_time": upload_time.isoformat(),
            "expires_at": expires_at.isoformat()
        }
        
        await db.files.insert_one(metadata)
        
        # Generate download URL
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        download_url = f"{frontend_url}/download/{file_id}"
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(download_url)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        qr_code_data = f"data:image/png;base64,{img_str}"
        
        return UploadResponse(
            id=file_id,
            filename=file.filename,
            size=file_size,
            download_url=download_url,
            qr_code=qr_code_data,
            expires_at=expires_at.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to upload file")


@api_router.get("/download/{file_id}")
async def download_file(file_id: str):
    try:
        # Get file metadata
        metadata = await db.files.find_one({"id": file_id}, {"_id": 0})
        
        if not metadata:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Check if file has expired
        expires_at = datetime.fromisoformat(metadata["expires_at"])
        if datetime.now(timezone.utc) > expires_at:
            # Delete expired file
            from gridfs import GridFS
            import pymongo
            sync_client = pymongo.MongoClient(mongo_url)
            sync_db = sync_client[os.environ['DB_NAME']]
            fs = GridFS(sync_db)
            fs.delete(file_id)
            await db.files.delete_one({"id": file_id})
            raise HTTPException(status_code=410, detail="File has expired")
        
        # Retrieve file from GridFS
        from gridfs import GridFS
        import pymongo
        sync_client = pymongo.MongoClient(mongo_url)
        sync_db = sync_client[os.environ['DB_NAME']]
        fs = GridFS(sync_db)
        
        if not fs.exists(file_id):
            raise HTTPException(status_code=404, detail="File data not found")
        
        grid_out = fs.get(file_id)
        file_data = grid_out.read()
        
        # Return file as streaming response
        return StreamingResponse(
            BytesIO(file_data),
            media_type=metadata["mimetype"],
            headers={
                "Content-Disposition": f'attachment; filename="{metadata["filename"]}"'
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Download error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to download file")


@api_router.get("/file/{file_id}", response_model=FileMetadata)
async def get_file_info(file_id: str):
    try:
        metadata = await db.files.find_one({"id": file_id}, {"_id": 0})
        
        if not metadata:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Check if expired
        expires_at = datetime.fromisoformat(metadata["expires_at"])
        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(status_code=410, detail="File has expired")
        
        # Convert ISO strings back to datetime
        metadata["upload_time"] = datetime.fromisoformat(metadata["upload_time"])
        metadata["expires_at"] = datetime.fromisoformat(metadata["expires_at"])
        
        return FileMetadata(**metadata)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get file info error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get file info")


# Background task to clean up expired files
async def cleanup_expired_files():
    while True:
        try:
            now = datetime.now(timezone.utc)
            
            # Find expired files
            expired_files = await db.files.find({
                "expires_at": {"$lt": now.isoformat()}
            }, {"_id": 0}).to_list(1000)
            
            from gridfs import GridFS
            import pymongo
            sync_client = pymongo.MongoClient(mongo_url)
            sync_db = sync_client[os.environ['DB_NAME']]
            fs = GridFS(sync_db)
            
            for file_meta in expired_files:
                # Delete from GridFS
                if fs.exists(file_meta["id"]):
                    fs.delete(file_meta["id"])
                
                # Delete metadata
                await db.files.delete_one({"id": file_meta["id"]})
            
            if expired_files:
                logger.info(f"Cleaned up {len(expired_files)} expired files")
                
        except Exception as e:
            logger.error(f"Cleanup error: {str(e)}")
        
        # Run cleanup every 10 minutes
        await asyncio.sleep(600)


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(cleanup_expired_files())


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
