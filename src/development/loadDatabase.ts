import mongoose = require('mongoose');
import async = require('async');
import path = require('path');
import * as fs from 'fs/promises';

import dotenv = require('dotenv');
dotenv.config();
import * as constants from '../definitions/constants';
const MONGODB_URI = process.env['MONGODB_URI']
                    || 'mongodb://127.0.0.1:27017/'
                       + constants._mongoDatabaseName;
const IMAGE_DIR = process.env['IMAGE_DIR'] || constants._imageDir;

/* Mongoose schemas.  */
import { Battle } from '../definitions/schemas/mongoose/battle';
import { Comment } from '../definitions/schemas/mongoose/comment';
import { Submission } from '../definitions/schemas/mongoose/submission';
import { User } from '../definitions/schemas/mongoose/user';
import { Vote } from '../definitions/schemas/mongoose/vote';
import { generateBattleData } from './generateBattleData';
import { generateUserData } from './generateUserData';

const getLocalISOString = (date: Date) => {
  const offset = date.getTimezoneOffset()
  const offsetAbs = Math.abs(offset)
  const isoString = new Date(date.getTime() - offset * 60 * 1000).toISOString()
  return `${isoString.slice(0, -1)}${offset > 0 ? '-' : '+'}${String(Math.floor(offsetAbs / 60)).padStart(2, '0')}:${String(offsetAbs % 60).padStart(2, '0')}`
};

const moveImagesToPublic = async (pathToImages: string, filename: string) => {
  const dir = await fs.opendir(pathToImages);
  for await (const imageDirent of dir) {
    const imagePath = path.join(pathToImages, imageDirent.name);
    const destDirPath = path.join('./', IMAGE_DIR, filename);
    fs.copyFile(imagePath, destDirPath);
  }
};

mongoose.connect(MONGODB_URI);
(async () => {
  /* Remove all existing data in the collections.  */
  const removePromises = [
    Battle.deleteMany({}),
    Comment.deleteMany({}),
    Submission.deleteMany({}),
    User.deleteMany({}),
    Vote.deleteMany({})
  ];
  try {
    await Promise.all(removePromises);
    console.log(`Removed all data in ${constants._mongoDatabaseName} database.`);
  } catch (err) {
    console.error(err);
  }

  await generateUserData();

  const battleDirs = await fs.readdir('./development/battles');
  await async.each(battleDirs, async (battleDir, callback) => {
    await generateBattleData(`./development/battles/${battleDir}`);
    callback();
  })

  mongoose.disconnect();
})();

export { getLocalISOString, moveImagesToPublic };
