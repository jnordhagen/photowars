"use strict"

import mongoose = require('mongoose');
import { AWS_DEFINED, deleteFileFromS3 } from '../../s3';
import { Battle } from './battle';
import { Comment } from './comment';
import { Submission } from './submission';
import { Vote } from './vote';

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         __v:
 *           type: number 
 *         description:
 *           type: string
 *         displayName:
 *           type: string
 *         filename:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         loginName:
 *           type: string
 *         loginPassword:
 *           type: string
 */
const userSchema = new mongoose.Schema({
  description: { type: String, default: '' },
  displayName: { type: String, required: true },
  filename: { type: String, default: '' },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  loginName: { type: String, required: true },
  loginPassword: { type: String, required: true }
});

userSchema.pre([
    'find',
    'findOne',
    'findOneAndDelete',
    'findOneAndRemove',
    'findOneAndReplace',
    'findOneAndUpdate'
  ], async function() {
    this.select(['-__v', '-loginName', '-loginPassword']);
});

/* Middleware to delete or update User-related documents before deletion.  */
userSchema.pre(['deleteMany', 'findOneAndDelete'], async function() {
  const _id = this.getQuery()['_id'];
  const result = await User.findOne(this.getQuery(), ['filename']);
  const filename = result?.filename || '';
  /* Delete user Votes.  */
  await Vote.deleteMany({ author: _id });
  /* Delete user-owned Comments.  */
  await Comment.deleteMany({ author: _id });
  /* Delete user-owned Submissions.  */
  await Submission.deleteMany({ author: _id });
  /* Delete user-owned Battles.  */
  await Battle.deleteMany({ author: _id });

  /* Delete user profile picture.  */
  if (AWS_DEFINED) {
    try {
      await deleteFileFromS3(filename);
    } catch (err) {
      console.error(err);
    }
  }
});

const User = mongoose.model('User', userSchema);

export { User };
