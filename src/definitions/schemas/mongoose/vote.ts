"use strict"

import mongoose = require('mongoose');

/**
 * @openapi
 * components:
 *   schemas:
 *     Vote:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         __v:
 *           type: number 
 *         author:
 *           $ref: '#/components/schemas/UserFrontend'
 *         creationTime:
 *           type: string
 *           format: date-time
 *         post:
 *           type: string
 *         votedModel:
 *           type: string
 */
const voteSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creationTime: { type: Date, default: Date.now, required: true },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'votedModel',
    required: true
  },
  votedModel: {
    type: String,
    enum: ['Battle', 'Comment', 'Submission'],
    required: true
  },
});

/* Enforce that each Vote is unique.  */
voteSchema.index(
  { post: 1, author: 1, votedModel: 1 },
  { unique: true }
);

const Vote = mongoose.model('Vote', voteSchema);

const voteOn = async (modelName: string, id: string, user: string) => {
  const vote = {
    post: id,
    author: user,
    votedModel: modelName
  };
  try {
    await Vote.findOneAndUpdate(vote, vote, { upsert: true }).lean().exec();
  } catch (err) {
    console.error(err);
  }
};

const unvoteOn = async (modelName: string, id: string, user: string) => {
  const vote = {
    post: id,
    author: user,
    votedModel: modelName
  };
  try {
    await Vote.findOneAndDelete(vote).lean().exec();
  } catch (err) {
    console.error(err);
  }
};

export { Vote, voteOn, unvoteOn };
