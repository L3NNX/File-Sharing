// src/utils/qr.js
import QRCode from "qrcode";

export const generateQR = async (url) => {
  return await QRCode.toDataURL(url);
};
