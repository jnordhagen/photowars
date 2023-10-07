'use strict';

import async = require('async');
import mongoose = require('mongoose');
import { Comment } from './comment';
import { AWS_DEFINED, deleteFileFromS3 } from '../../s3';
import { Submission } from './submission';
import { Vote } from './vote';

/**
 * @openapi
 * components:
 *   schemas:
 *     Battle:
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
 *         deadline:
 *           type: string
 *           format: date-time
 *         filename:
 *           type: string
 */
const battleSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  caption: { type: String, required: true},
  creationTime: { type: Date, default: Date.now, required: true },
  deadline: { type: Date, required: true},
  filename: { type: String, required: true},
});

battleSchema.pre([
    'find',
    'findOne',
  ], async function() {
    if (!this.projection() || 'author' in this.projection()) this.populate('author');
});

/* Middleware to delete or update Battle-related documents before deletion.  */
battleSchema.pre(['deleteMany', 'findOneAndDelete'], async function () {
  const results = await Battle.find(this.getQuery(), ['_id', 'filename']);
  const _ids = results.map((battle) => battle._id);
  const filenames = results.map((battle) => battle.filename);
  /* Delete all votes on Battle.  */
  await Vote.deleteMany({
    votedModel: 'Battle',
    post: { $in: _ids },
  });
  /* Delete all comments on Battle.  */
  await Comment.deleteMany({
    commentedModel: 'Battle',
    post: { $in: _ids },
  });
  /* Delete all submissions to Battle.  */
  await Submission.deleteMany({
    post: { $in: _ids },
  });

  /* Delete image associated with Battle.  */
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

const Battle = mongoose.model('Battle', battleSchema);

export { Battle };
