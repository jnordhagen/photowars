'use strict';

import fs = require('fs');
import path = require('path');
import mongoose = require('mongoose');
import express = require('express');
import { Battle } from '../../definitions/schemas/mongoose/battle';
import { checkSchema, matchedData, validationResult } from 'express-validator';
import { NewBattle } from '../../definitions/schemas/validation/newBattle';
import { NewSubmission } from '../../definitions/schemas/validation/newSubmission';
import { Submission } from '../../definitions/schemas/mongoose/submission';
import { Comment } from '../../definitions/schemas/mongoose/comment';
import { Vote } from '../../definitions/schemas/mongoose/vote';
import { UpdateBattle } from '../../definitions/schemas/validation/updateBattle';
import { ValidObjectId } from '../../definitions/schemas/validation/validObjectId';
import { upload } from '../../server';
import { AWS_DEFINED, uploadFileToS3 } from '../../definitions/s3';
import { voteOn, unvoteOn } from '../../definitions/schemas/mongoose/vote';

import * as constants from '../../definitions/constants';
const IMAGE_DIR = process.env['IMAGE_DIR'] || constants._imageDir;
const battleRouter = express.Router();

/**
 * @openapi
 * /battle/all:
 *   get:
 *     summary: Get all battle IDs, filtering for open comps only if needed.
 *     parameters:
 *       - in: query
 *         name: open
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resource successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500'
 */
battleRouter.get('/all', async (req, res) => {
  const filter = {} as {
    deadline?: { $gte: Date };
    _id?: { $ne: mongoose.Types.ObjectId };
  };
  if (req.query['open'] === 'true') {
    /* Filter for all battles that have at least an hour left.  */
    const today = new Date();
    const futureDeadline = new Date();
    futureDeadline.setHours(today.getHours() + 1);
    filter.deadline = { $gte: futureDeadline };
  }

  let dailyBattle:
    | (mongoose.FlattenMaps<{
        author: mongoose.Types.ObjectId;
        caption: string;
        creationTime: Date;
        deadline: Date;
        filename: string;
      }> & {
        _id: mongoose.Types.ObjectId;
      })
    | null = null;
  {
    /* Retrieve a random battle for the day.  */
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const grEqOneDayFilter = {
      deadline: {
        $gte: tomorrow,
      },
    };
    const count = await Battle.countDocuments(grEqOneDayFilter).exec();
    const numToSkip = Math.floor(today.getTime() / (3600 * 24 * 1000)) % count;
    const query = Battle.findOne(grEqOneDayFilter, ['_id']).skip(numToSkip);
    dailyBattle = await query.lean().exec();
    if (dailyBattle) {
      filter._id = { $ne: dailyBattle._id };
    }
  }

  const query = Battle.find(filter, ['_id']);
  try {
    const result = await query.lean().exec();
    if (dailyBattle) result.unshift(dailyBattle);
    if (result) {
      /* Retrieved battle ids.  */
      res.status(200).json(result);
    } else {
      /* Did not find a battles.  */
      res.status(404).send('Invalid battle id.');
    }
  } catch (err) {
    res.status(500).send('Internal server error.');
    console.error(err);
  }
});

/**
 * @openapi
 * /battle/random:
 *   get:
 *     summary: Retrieve a random, open battle.
 *     responses:
 *       200:
 *         description: Resource successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *       500:
 *         $ref: '#/components/responses/500'
 */
battleRouter.get('/random', async (_req, res) => {
  try {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const filter = {
      deadline: {
        $gte: tomorrow,
      },
    };
    const count = await Battle.countDocuments(filter).exec();
    const numToSkip = Math.floor(today.getTime() / (3600 * 24 * 1000)) % count;
    const query = Battle.findOne(filter, ['_id']).skip(numToSkip);
    const result = await query.exec();
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send('Internal server error.');
    console.error(err);
  }
});

/**
 * @openapi
 * /battle/{id}:
 *   get:
 *     summary: Return information about a battle.
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Resource successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Battle'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500'
 */
battleRouter.get(
  '/:id',
  upload.none(),
  checkSchema(ValidObjectId),
  async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(404).json({
        errors: errors.array(),
      });
      return;
    }

    const battleId = req.params['id'];
    const query = Battle.findById(battleId);

    const numCommentsQuery = Comment.countDocuments({ post: battleId });
    const numSubmissionsQuery = Submission.countDocuments({ post: battleId });
    const numVotesQuery = Vote.countDocuments({ post: battleId });

    const commentedOnQuery = Comment.findOne({
      post: battleId,
      author: req.session.userId,
    });
    const submittedToQuery = Submission.findOne({
      post: battleId,
      author: req.session.userId,
    });
    const votedOnQuery = Vote.findOne({
      post: battleId,
      author: req.session.userId,
    });
    try {
      let result = await query.populate('author').lean().exec();
      if (result) {
        /* Found battle matching battle id.  */
        const numComments = await numCommentsQuery.exec();
        const numSubmissions = await numSubmissionsQuery.exec();
        const numVotes = await numVotesQuery.exec();

        let commentedOn,
          submittedTo,
          votedOn = null;
        if (mongoose.Types.ObjectId.isValid(req.session.userId || '')) {
          commentedOn = !!(await commentedOnQuery.lean().exec());
          submittedTo = !!(await submittedToQuery.lean().exec());
          votedOn = !!(await votedOnQuery.lean().exec());
        }
        result = {
          ...result,
          ...{
            numComments: numComments,
            commentedOn: commentedOn,
            numSubmissions: numSubmissions,
            submittedTo: submittedTo,
            numVotes: numVotes,
            votedOn: votedOn,
          },
        };
        res.status(200).json(result);
      } else {
        /* Did not find a battle with matching battle id.  */
        res.status(404).send('Invalid battle id.');
      }
    } catch (err) {
      res.status(500).send('Internal server error.');
      console.error(err);
    }
  }
);

/**
 * @openapi
 * /battle/{id}:
 *   put:
 *     summary: Update battle information if user is the battle creator.
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       description: Battle information to be updated.
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               caption:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *             required:
 *               - caption
 *               - deadline
 *     responses:
 *       200:
 *         description: Successfully updated battle information.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Battle'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500'
 */
battleRouter.put(
  '/:id',
  upload.none(),
  checkSchema({ ...ValidObjectId, ...UpdateBattle }),
  async (req: express.Request, res: express.Response) => {
    if (!req.session.loggedIn) {
      res.status(401).send('Not logged in.');
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if ('id' in errors.mapped()) {
        res.status(404);
      } else {
        res.status(400);
      }
      res.json({
        errors: errors.array(),
      });
      return;
    }

    const battleId = req.params['id'];
    const query = Battle.findById(battleId);
    try {
      const result = await query.exec();
      if (!result) {
        /* Did not find a battle with matching battle id. */
        res.status(404).send('Invalid battle id.');
        return;
      }

      if (result.author.toString() !== req.session.userId) {
        /* User is not the owner of the resource.  */
        res.status(403).send('Access to that resource is forbidden.');
        return;
      }

      const body = matchedData(req);
      const updatedBattle = await Battle.findByIdAndUpdate(
        battleId,
        { $set: body },
        { new: true }
      ).exec();

      res.status(200).json(updatedBattle);
    } catch (err) {
      res.status(500).send('Internal server error.');
      console.error(err);
    }
  }
);

/**
 * @openapi
 * /battle/new:
 *   post:
 *     summary: Creating a new battle by a user.
 *     requestBody:
 *       description: Battle information to be updated.
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               caption:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               file:
 *                 type: string
 *                 format: binary
 *             required:
 *               - caption
 *               - deadline
 *               - file
 *     responses:
 *       200:
 *         description: Successfully created new battle.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Battle'
 *       400:
 *         description: Missing or invalid information to create a new battle.
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 *       500:
 *         $ref: '#/components/responses/500'
 */
battleRouter.post(
  '/new',
  upload.single('file'),
  checkSchema(NewBattle),
  async (req: express.Request, res: express.Response) => {
    if (!req.file) {
      res.status(400).send('Invalid file.');
      return;
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await fs.promises.unlink(path.join(IMAGE_DIR, req.file.filename));
      res.status(400).json({
        errors: errors.array(),
      });
      return;
    }

    if (!req.session.loggedIn) {
      await fs.promises.unlink(path.join(IMAGE_DIR, req.file.filename));
      res.status(401).send('Not logged in.');
      return;
    }

    try {
      const newBattleObj = await Battle.create({
        ...{
          author: req.session.userId,
          filename: req.file.filename,
        },
        ...matchedData(req),
      });
      /* Uploading to S3.  */
      if (AWS_DEFINED) {
        await uploadFileToS3(req.file);
        // await fs.promises.unlink(path.join(IMAGE_DIR, req.file.filename));
      }
      res.status(200).json(newBattleObj);
    } catch (err) {
      res.status(500).send('Internal server error.');
      await fs.promises.unlink(path.join(IMAGE_DIR, req.file.filename));
      console.error(err);
    }
  }
);

/**
 * @openapi
 * /battle/{id}/submit:
 *   post:
 *     summary: Creating a new submission to a battle by a user.
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       description: Submission object.
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               caption:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *             required:
 *               - caption
 *               - file
 *     responses:
 *       200:
 *         description: Successfully created new submission.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Submission'
 *       400:
 *         description: Missing information to create a new submission.
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500'
 */
battleRouter.post(
  '/:id/submit',
  upload.single('file'),
  checkSchema({ ...ValidObjectId, ...NewSubmission }),
  async (req: express.Request, res: express.Response) => {
    if (!req.file) {
      res.status(400).send('Invalid file.');
      return;
    }

    if (!req.session.loggedIn) {
      await fs.promises.unlink(path.join('.', IMAGE_DIR, req.file.filename));
      res.status(401).send('Not logged in.');
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await fs.promises.unlink(path.join('.', IMAGE_DIR, req.file.filename));
      if ('id' in errors.mapped()) {
        res.status(404);
      } else {
        res.status(400);
      }
      res.json({
        errors: errors.array(),
      });
      return;
    }

    const battleId = req.params['id'];
    try {
      const battleObj = await Battle.findById(battleId).lean().exec();
      if (!battleObj) {
        /* Battle does not exist.  */
        await fs.promises.unlink(path.join('.', IMAGE_DIR, req.file.filename));
        res.status(404).send('Battle does not exist.');
        return;
      }
      const newSubmissionObj = await Submission.create({
        ...{
          author: req.session.userId,
          post: battleId,
          filename: req.file.filename,
        },
        ...matchedData(req),
      });
      /* Uploading to S3.  */
      if (AWS_DEFINED) {
        await uploadFileToS3(req.file);
        await fs.promises.unlink(path.join(IMAGE_DIR, req.file.filename));
      }
      res.status(200).json(newSubmissionObj);
    } catch (err) {
      await fs.promises.unlink(path.join('.', IMAGE_DIR, req.file.filename));
      res.status(500).send('Internal server error.');
    }
  }
);

/**
 * @openapi
 * /battle/{id}/vote:
 *   put:
 *     summary: Vote on a battle.
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Successfully voted on battle.
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500'
 */
battleRouter.put(
  '/:id/vote',
  upload.none(),
  checkSchema(ValidObjectId),
  async (req: express.Request, res: express.Response) => {
    if (!req.session.loggedIn || !req.session.userId) {
      res.status(401).send('Must be logged in to perform this action.');
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(404).json({
        errors: errors.array(),
      });
      return;
    }

    const battleId = req.params['id'];
    if (!battleId) {
      res.status(404).send('Resource not found.');
      return;
    }
    const query = Battle.findOne({ _id: battleId });
    try {
      const result = await query.lean().exec();
      if (!result) {
        res.status(404).send('Resource not found.');
        return;
      }

      await voteOn('Battle', battleId, req.session.userId);
      res.status(200).send('Successfully voted on battle.');
    } catch (err) {
      res.status(500).send('Internal server error.');
      console.error(err);
    }
  }
);

/**
 * @openapi
 * /battle/{id}/unvote:
 *   put:
 *     summary: Unvote a battle.
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Successfully unvoted battle.
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500'
 */
battleRouter.put(
  '/:id/unvote',
  upload.none(),
  checkSchema(ValidObjectId),
  async (req: express.Request, res: express.Response) => {
    if (!req.session.loggedIn || !req.session.userId) {
      res.status(401).send('Must be logged in to perform this action.');
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(404).json({
        errors: errors.array(),
      });
      return;
    }

    const battleId = req.params['id'];
    if (!battleId) {
      res.status(404).send('Resource not found.');
      return;
    }
    const query = Battle.findOne({ _id: battleId });
    try {
      const result = await query.lean().exec();
      if (!result) {
        res.status(404).send('Resource not found.');
        return;
      }

      await unvoteOn('Battle', battleId, req.session.userId);
      res.status(200).send('Successfully unvoted battle.');
    } catch (err) {
      res.status(500).send('Internal server error.');
      console.error(err);
    }
  }
);

/**
 * @openapi
 * /battle/{id}/comments:
 *   get:
 *     summary: Retrieve comments for battle.
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Resource successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500'
 */
battleRouter.get(
  '/:id/comments',
  upload.none(),
  checkSchema(ValidObjectId),
  async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(404).json({
        errors: errors.array(),
      });
      return;
    }

    const battleId = req.params['id'];
    const query = Comment.find({
      commentedModel: 'Battle',
      post: battleId,
    })
      .populate('author')
      .populate('post', ['-author', '-__v']);

    try {
      const result = await query.lean().exec();
      if (result) {
        /* Found comments on battle. */
        res.status(200).json(result);
      } else {
        /* Did not find a battle with matching battleId. */
        res.status(404).send('Invalid battle id.');
      }
    } catch (err) {
      res.status(500).send('Internal server error.');
      console.error(err);
    }
  }
);

/**
 * @openapi
 * /battle/{id}/comment:
 *   post:
 *     summary: Creating a new comment by a user on a battle.
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       description: Comment information.
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully created new comment.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Missing information to create a new comment.
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 *       500:
 *         $ref: '#/components/responses/500'
 */
battleRouter.post(
  '/:id/comment',
  upload.none(),
  checkSchema(ValidObjectId),
  async (req: express.Request, res: express.Response) => {
    if (!req.session.loggedIn) {
      res.status(401).send('Not logged in.');
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(404).json({
        errors: errors.array(),
      });
      return;
    }

    if (req.body.comment === '') {
      res.status(400).send('Missing information to create a new comment.');
      return;
    }
    const battleId = req.params['id'];
    try {
      const newCommentObj = await Comment.create({
        author: req.session.userId,
        commentedModel: 'Battle',
        post: battleId,
        caption: req.body.comment,
      });
      res.status(200).json(newCommentObj);
    } catch (err) {
      res.status(500).send('Internal server error.');
      console.error(err);
    }
  }
);

/**
 * @openapi
 * /battle/{id}:
 *   delete:
 *     summary: Delete battle if user is the battle creator.
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Successfully deleted battle.
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500'
 */
battleRouter.delete(
  '/:id',
  upload.none(),
  checkSchema(ValidObjectId),
  async (req: express.Request, res: express.Response) => {
    if (!req.session.loggedIn) {
      res.status(401).send('User not logged in.');
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(404).json({
        errors: errors.array(),
      });
      return;
    }

    const battleId = req.params['id'];
    /* Delete battle.  */
    const query = Battle.findOneAndDelete({
      _id: battleId,
      author: req.session.userId,
    });
    try {
      const battleObj = await query.lean().exec();
      if (!battleObj) {
        res.status(404).send('Failed to find battle.');
      } else {
        res.status(200).send('Successfully deleted battle.');
      }
    } catch (err) {
      res.status(500).send('Internal server error.');
      console.error(err);
    }
  }
);

/**
 * @openapi
 * /battle/{id}/submissions:
 *   get:
 *     summary: Retrieve submissions for battle.
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Resource successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Submission'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500'
 */
battleRouter.get(
  '/:id/submissions',
  upload.none(),
  checkSchema(ValidObjectId),
  async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(404).json({
        errors: errors.array(),
      });
      return;
    }

    const battleId = req.params['id'];
    try {
      const battleObj = await Battle.findById(battleId).lean().exec();
      /* Did not find battle with matching battleId. */
      if (!battleObj) {
        res.status(404).send('Invalid battle id.');
        return;
      }
      const result = await Submission.find({
        post: battleId,
      })
        .lean()
        .exec();
      if (req.query['sort'] === 'top') {
        for (const submission of result) {
          (submission as any).numVotes = await Vote.countDocuments({
            post: submission._id,
            votedModel: 'Submission',
          }).exec();
        }
        result.sort((a, b) => {
          return (b as any).numVotes - (a as any).numVotes;
        });
      } else if (req.query['sort'] === 'new') {
        result.sort((a, b) => {
          return b.creationTime.getTime() - a.creationTime.getTime();
        });
      }
      /* Return submissions on battle. */
      res.status(200).json(result);
    } catch (err) {
      res.status(500).send('Internal server error.');
      console.error(err);
    }
  }
);

export { battleRouter };
