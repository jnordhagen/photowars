"use strict";

import mongoose = require('mongoose');

import * as constants from '../definitions/constants';

const MONGODB_URI = process.env['MONGODB_URL']
                    || 'mongodb://127.0.0.1:27017/'
                       + constants._mongoDatabaseName;
mongoose.connect(MONGODB_URI);

/* Mongoose schemas.  */
import { Battle } from '../definitions/schemas/mongoose/battle';
import { Comment } from '../definitions/schemas/mongoose/comment';
import { Submission } from '../definitions/schemas/mongoose/submission';
import { User } from '../definitions/schemas/mongoose/user';
import { Vote } from '../definitions/schemas/mongoose/vote';

/* Remove all existing data in the collections.  */
const removePromises = [
  Battle.deleteMany({}),
  Comment.deleteMany({}),
  Submission.deleteMany({}),
  User.deleteMany({}),
  Vote.deleteMany({})
];

Promise.all(removePromises).then(() => {
  /* All existing data has been removed.  */
  console.log(`Removed all data in ${constants._mongoDatabaseName} database.`);
  mongoose.disconnect();
}).catch((err) => {
  console.error('Error removing data.', err);
});
