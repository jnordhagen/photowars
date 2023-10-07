"use strict"

import express = require('express');
import path = require('path');

import { AWS_BUCKET_NAME, AWS_DEFINED, AWS_REGION } from '../../definitions/s3';
import * as constants from '../../definitions/constants';

const IMAGE_DIR = process.env['IMAGE_DIR'] || constants._imageDir;
const imageRouter = express.Router();

/**
 * @openapi
 * /image/{filename}:
 *   get:
 *     summary: Retrieves image with filename.
 *     parameters:
 *       - in: path
 *         name: filename
 *         schema:
 *           type: string
 *         required: true
 *         description: Filename of the image.
 *     responses:
 *       200:
 *         description: Resource successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *
 */
imageRouter.get('/:filename', async (req, res) => {
  const filename = req.params.filename;
  if (AWS_DEFINED) {
    /* Get file from Amazon S3 storage.  */
    const fileKey = path.join(IMAGE_DIR, filename);
    const url = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${fileKey}`;
    res.send(url);
  } else {
    /* Get file from local file system.  */
    const options = {
      root: IMAGE_DIR,
      headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
      }
    };
    res.sendFile(filename, options, (err) => {
      if (err) {
        console.error('Failed to send file.', err);
        res.status(404).send('Image does not exist.');
      }
    });
  }
});

export { imageRouter };
