import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

export const documentUploadConfig = {
  storage: diskStorage({
    destination: (req: any, file, cb) => {
      const driverId = req.driverId;

      if (!driverId) {
        return cb(new Error('Driver ID not found in request'), '');
      }

      const uploadPath = join(
        process.cwd(),
        'uploads',
        'driver-documents',
        driverId.toString(),
      );

      // create folder if not exists
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
      // aadhaar | panCard | licenseFront | licenseBack
      const extension = extname(file.originalname);
      const filename = `${file.fieldname}${extension}`;
      cb(null, filename);
    },
  }),
};
