import path = require('path');
import async = require('async');
import { fakeUsers } from "./users";
import { User } from "../definitions/schemas/mongoose/user";
import { uploadFileToS3 } from '../definitions/s3';

/* Get constants.  */
import dotenv = require('dotenv');
import { moveImagesToPublic } from './loadDatabase';
dotenv.config();

const generateUserData = async () => {
  try {
    await async.each(fakeUsers, async (user, callback) => {
      await User.create(user);
      if (process.env['IMAGE_DIR']) {
        await uploadFileToS3({
          path: path.join('development/images', user.filename),
          filename: user.filename
        });
        console.log(`Uploaded file ${user.filename} to Amazon S3.`);
      } else {
        const imagePath = 'development/images';
        await moveImagesToPublic(imagePath, user.filename);
      }
      callback();
    });
  } catch (err) {
    console.error(err);
  }
};

export { generateUserData };