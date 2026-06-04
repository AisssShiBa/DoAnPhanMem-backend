import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export const getUploadPathFromUrl = (fileUrl: string): string | null => {
  const marker = "/uploads/";
  const index = fileUrl.indexOf(marker);
  if (index === -1) return null;

  const rawFileName = fileUrl.slice(index + marker.length);
  if (!rawFileName) return null;

  const fileName = path.basename(decodeURIComponent(rawFileName));
  const fullPath = path.join(UPLOADS_DIR, fileName);

  if (!fullPath.startsWith(UPLOADS_DIR)) return null;
  return fullPath;
};

export const deleteLocalUploadByUrl = (fileUrl: string) => {
  const filePath = getUploadPathFromUrl(fileUrl);
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
