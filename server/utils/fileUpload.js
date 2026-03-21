import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif/;
  const allowedDocTypes = /pdf|doc|docx/;
  
  const extname = path.extname(file.originalname).toLowerCase();
  
  if (file.fieldname === "photo" || file.fieldname === "screenshot") {
    if (allowedImageTypes.test(extname)) return cb(null, true);
    return cb(new Error("Only images are allowed"));
  }
  
  if (file.fieldname === "resume") {
    if (allowedDocTypes.test(extname)) return cb(null, true);
    return cb(new Error("Only documents (pdf, doc, docx) are allowed"));
  }
  
  cb(null, true);
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
