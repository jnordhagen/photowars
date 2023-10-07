"use strict";

import dotenv = require('dotenv');
dotenv.config();
import fs = require('fs');
import path = require('path');
import * as constants from './constants';
const IMAGE_DIR = process.env['IMAGE_DIR'] || constants._imageDir;
import { Upload } from '@aws-sdk/lib-storage';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';

const AWS_ACCESS_KEY_ID = process.env['AWS_ACCESS_KEY_ID'] || '';
const AWS_REGION = process.env['AWS_REGION'] || '';
const AWS_SECRET_ACCESS_KEY = process.env['AWS_SECRET_ACCESS_KEY'] || '';
const AWS_BUCKET_NAME = process.env['BUCKET_NAME'] || '';

let AWS_DEFINED = false;

if (AWS_ACCESS_KEY_ID
    && AWS_REGION
    && AWS_SECRET_ACCESS_KEY
    && AWS_BUCKET_NAME) AWS_DEFINED = true;

const s3Client = AWS_DEFINED && new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  }
});

/* Upload file to S3 instance.  */
const uploadFileToS3 = (file: { path: string, filename: string }) => {
  const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Body: fileStream,
    Bucket: AWS_BUCKET_NAME,
    Key: path.join(IMAGE_DIR, file.filename),
  };
  return s3Client && new Upload({
    client: s3Client,
    params: uploadParams
  }).done();
};

const deleteFileFromS3 = async (filename: string) => {
  const deleteParams = {
    Bucket: AWS_BUCKET_NAME,
    Key: path.join(IMAGE_DIR, filename)
  };
  const command = new DeleteObjectCommand(deleteParams);

  try {
    s3Client && await s3Client.send(command);
  } catch (err) {
    console.error(err);
  }
};

export { AWS_BUCKET_NAME, AWS_DEFINED, AWS_REGION, uploadFileToS3, deleteFileFromS3 };
