import multer from "multer";
import path from "path";
// import { v4 as uuidv4 } from "uuid";

const checkFileType = function (file, cb) {
  const fileTypes =
    /jpeg|jpg|png|gif|svg|jfif|mp4|mov|wmv|flv|avi|avchd|webm|pdf/;

  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "File format is invalid, try using jpeg|jpg|png|gif|svg|jfif|mp4|mov|wmv|flv|avi|avchd|webm|pdf formates"
      )
    );
  }
};
const storage = multer.memoryStorage();
// const storageEngine = multer.diskStorage({
//   destination: "./uploads",
//   filename: (req, file, cb) => {
//     cb(
//       null,
//       `${uuidv4()}-${file.originalname.toLowerCase().split(" ").join("-")}`
//     );
//   },
// });

export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
  limits: {
    files: 10,
    fileSize: 200 * 1024 * 1024, //30mb,
  },
});
