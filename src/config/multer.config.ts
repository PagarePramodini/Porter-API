import { diskStorage } from 'multer';
import { extname } from 'path';

export const documentUploadConfig = {
  storage: diskStorage({
    destination: './uploads/driver-documents',
    filename: (req, file, callback) => {
      const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
      callback(null, uniqueName + extname(file.originalname));
    },
  }),
};
