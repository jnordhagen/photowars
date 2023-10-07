'use strict';

import async = require('async');
import mongoose = require('mongoose');
import { Comment } from './comment';
import { AWS_DEFINED, deleteFileFromS3 } from '../../s3';
import { Vote } from './vote';

/**
 * @openapi
 * components:
 *   schemas:
 *     Submission:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         __v:
 *           type: number
 *         author:
 *           $ref: '#/components/schemas/UserFrontend'
 *         caption:
 *           type: string
 *         creationTime:
 *           type: string
 *           format: date-time
 *         filename:
 *           type: string
 *         post:
 *           type: string
 */
const submissionSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Battle', required: true },
  caption: { type: String, default: '' },
  creationTime: { type: Date, default: Date.now, required: true },
  filename: { type: String, required: true },
});

/* Enforce that each user can only submit once.  */
submissionSchema.index(
  { post: 1, author: 1 },
  { unique: true }
);

submissionSchema.pre([
    'find',
    'findOne',
  ], async function() {
    this.populate('author');
});

/* Middleware to delete or update Submission-related documents before deletion.  */
submissionSchema.pre(['deleteMany', 'findOneAndDelete'], async function () {
  const results = await Submission.find(this.getQuery(), ['_id', 'filename']);
  const _ids = results.map((submission) => submission._id);
  const filenames = results.map((submission) => submission.filename);
  /* Delete all votes on Submission.  */
  await Vote.deleteMany({
    votedModel: 'Submission',
    post: { $in: _ids },
  });
  /* Delete comments on Submission.  */
  await Comment.deleteMany({
    commentedModel: 'Submission',
    post: { $in: _ids },
  });
  
  /* Delete image associated with Submission.  */
  if (AWS_DEFINED) {
    try {
      await async.each(filenames, async (filename, callback) => {
        await deleteFileFromS3(filename);
        callback();
      });
    } catch (err) {
      console.error(err);
    }
  }
});

const Submission = mongoose.model('Submission', submissionSchema);

export { Submission };
