import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadPage from "@/pages/UploadPage";
import SuccessPage from "@/pages/SuccessPage";
import DownloadPage from "@/pages/DownloadPage";
import { Toaster } from "@/components/ui/sonner";
import { About } from "./pages/About";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/success/:fileId" element={<SuccessPage />} />
          <Route path="/download/:fileId" element={<DownloadPage />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
