'use strict';

import express = require('express');
import fs = require('fs');
import mongoose = require('mongoose');
import MongoStore = require('connect-mongo');
import multer = require('multer');
import path = require('path');
import session = require('express-session');

import * as constants from './definitions/constants';

const IMAGE_DIR = process.env['IMAGE_DIR'] || constants._imageDir;
const MONGODB_URI = process.env['MONGODB_URI']
                    || 'mongodb://127.0.0.1:27017/'
                       + constants._mongoDatabaseName;
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, IMAGE_DIR);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

const app = express();
/* Allowing express to use middlewares. */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'dist')));
app.use(
  session({
    cookie: {},
    resave: false,
    saveUninitialized: false,
    secret: process.env['SESSIONSECRET'] || constants._sessionSecret,
    store: MongoStore.create({ mongoUrl: MONGODB_URI })
  })
);

import { accountRouter } from './endpoints/account/account';
app.use('/account', accountRouter);

import { battleRouter } from './endpoints/battle/battle';
app.use('/battle', battleRouter);

import { commentRouter } from './endpoints/comment/comment';
app.use('/comment', commentRouter);

import { imageRouter } from './endpoints/image/image';
app.use('/image', imageRouter);

import { submissionRouter } from './endpoints/submission/submission';
app.use('/submission', submissionRouter);

import { swaggerRouter } from './endpoints/swagger/swagger';
app.use('/swagger', swaggerRouter);

import { testRouter } from './endpoints/test/test';
app.use('/test', testRouter);

import { userRouter } from './endpoints/user/user';
app.use('/user', userRouter);

import { voteRouter } from './endpoints/vote/vote';
app.use('/vote', voteRouter);

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

async function initServer() {
  mongoose.connect(MONGODB_URI);

  if (!fs.existsSync(IMAGE_DIR)){
    fs.mkdirSync(IMAGE_DIR, { recursive: true });
  }

  const PORT = process.env['PORT'] || constants._portNum;
  app.listen(PORT, function() {
    console.log('Listening at http://127.0.0.1:' + PORT
                + ' exporting the directory ' + __dirname + '.');
  });
}
initServer();

export { upload };
