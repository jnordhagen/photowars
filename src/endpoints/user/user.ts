'use strict';

import { Request, Response, Router } from 'express';
import fs = require('fs');
import path = require('path');
import { AWS_DEFINED, deleteFileFromS3, uploadFileToS3 } from '../../definitions/s3';
import { checkSchema, matchedData, validationResult } from 'express-validator';
import { Battle } from '../../definitions/schemas/mongoose/battle';
import { Comment } from '../../definitions/schemas/mongoose/comment';
import { Submission } from '../../definitions/schemas/mongoose/submission';
import { upload } from '../../server';
import { User } from '../../definitions/schemas/mongoose/user';
import { Vote } from '../../definitions/schemas/mongoose/vote';
import { UpdateUser } from '../../definitions/schemas/validation/updateUser';

import * as constants from '../../definitions/constants';
const IMAGE_DIR = process.env['IMAGE_DIR'] || constants._imageDir;

const userRouter = Router();

/**
 * @openapi
 * /user/{id}:
 *   get:
 *     summary: Returns information for user with id.
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Resource successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserFrontend'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500'
 */
userRouter.get('/:id', async (req, res) => {
  const userId = req.params.id;
  const query = User.findOne({ _id: userId });

  try {
    const userObj = await query.lean().exec();
    if (!userObj) {
      res.status(404).send('Resource not found.');
      return;
    }
    res.status(200).json(userObj);
  } catch (err) {
    res.status(500).send('Internal server error.');
    return;
  }
});

/**
 * @openapi
 * /user:
 *   put:
 *     summary: Update user profile information.
 *     requestBody:
 *       description: User profile information to be updated.
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               displayName:
 *                 type: string
 *               filename:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *             required:
 *               - description
 *               - displayName
 *               - filename
 *               - firstName
 *               - lastName
 *     responses:
 *       200:
 *         description: Successfully updated user data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserFrontend'
 *       400:
 *         description: Invalid information to update user.
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500'
 */
userRouter.put('/', upload.single('file'), checkSchema(UpdateUser), async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.file && await fs.promises.unlink(path.join(IMAGE_DIR, req.file.filename));
    res.status(400).json({
      errors: errors.array(),
    });
    return;
  }

  if (!req.session.loggedIn) {
    req.file && await fs.promises.unlink(path.join(IMAGE_DIR, req.file.filename));
    res.status(401).send('User not logged in.');
    return;
  }
  
  const query = User.findOneAndUpdate(
    { _id: req.session.userId },
    {
      $set: {
        ...(req.file ? {filename: req.file.filename} : {}),
        ...matchedData(req)
      }
    }
  );
  try {
    const userObj = await query.lean().exec();
    if (!userObj) {
      req.file && await fs.promises.unlink(path.join(IMAGE_DIR, req.file.filename));
      res.status(404).send('Failed to find user.');
      console.error('Failed to find user.');
    } else {
      if (AWS_DEFINED && req.file) {
        /* Uploading profile picture to S3 and delete old profile picture.  */
        await deleteFileFromS3(userObj.filename);
        await uploadFileToS3(req.file);
        // await fs.promises.unlink(path.join(IMAGE_DIR, req.file.filename));
      }

      const newQuery = User.findById(req.session.userId, [
        '-__v',
        '-loginName',
        '-loginPassword',
      ]);
      const newUserObj = await newQuery.lean().exec();
      res.status(200).json(newUserObj);
    }
  } catch (err) {
    req.file && await fs.promises.unlink(path.join(IMAGE_DIR, req.file.filename));
    res.status(500).send('Internal server error.');
    console.error(err);
  }
});

/**
 * @openapi
 * /user:
 *   delete:
 *     summary: Delete user.
 *     responses:
 *       200:
 *         description: Successfully deleted user.
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500'
 */
userRouter.delete('/', async (req, res) => {
  if (!req.session.loggedIn) {
    res.status(401).send('User not logged in.');
    return;
  }

  /* Delete user.  */
  const query = User.findOneAndDelete({ _id: req.session.userId });
  try {
    const userObj = await query.lean().exec();
    if (!userObj) {
      res.status(404).send('Failed to find user.');
      console.error('Failed to find user.');
    } else {
      res.status(200).send('Successfully deleted user.');
    }
  } catch (err) {
    res.status(500).send('Internal server error.');
    console.error(err);
  }
});

/**
 * @openapi
 * /user/{id}/battles:
 *   get:
 *     summary: Returns all battles created by user.
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
 *                 type: string
 *       500:
 *         $ref: '#/components/responses/500'
 */
userRouter.get('/:id/battles', async (req, res) => {
  const userId = req.params.id;
  const query = Battle.find({ author: userId }, ['_id']);

  try {
    const battleIds = await query.lean().exec();
    res.status(200).json(battleIds);
  } catch (err) {
    res.status(500).send('Internal server error.');
    return;
  }
});

/**
 * @openapi
 * /user/{id}/comments:
 *   get:
 *     summary: Returns all comments created by user.
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
 *                 type: string
 *       500:
 *         $ref: '#/components/responses/500'
 */
userRouter.get('/:id/comments', async (req, res) => {
  const userId = req.params.id;
  const query = Comment.find({ author: userId }, ['_id']);

  try {
    const comments = await query.lean().exec();
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).send('Internal server error.');
    return;
  }
});

/**
 * @openapi
 * /user/{id}/submissions:
 *   get:
 *     summary: Returns all submissions created by user.
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
 *                 type: string
 *       500:
 *         $ref: '#/components/responses/500'
 */
userRouter.get('/:id/submissions', async (req, res) => {
  const userId = req.params.id;
  const query = Submission.find({ author: userId }, ['_id', 'post']);

  try {
    const submissions = await query.lean().exec();
    res.status(200).json(submissions);
  } catch (err) {
    res.status(500).send('Internal server error.');
    return;
  }
});

/**
 * @openapi
 * /user/{id}/votes:
 *   get:
 *     summary: Returns all content voted on by user.
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
 *                 type: string
 *       500:
 *         $ref: '#/components/responses/500'
 */
userRouter.get('/:id/votes', async (req, res) => {
  const userId = req.params.id;
  const query = Vote.find({ author: userId }, ['-_id', '-__v']);

  try {
    const voteIds = await query.populate('post', ['_id']).lean().exec();
    res.status(200).json(voteIds);
  } catch (err) {
    res.status(500).send('Internal server error.');
    return;
  }
});

export { userRouter };
