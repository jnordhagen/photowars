'use strict';

import mongoose = require('mongoose');
import { Request, Response, Router } from 'express';
import { checkSchema, matchedData, validationResult } from 'express-validator';
import { UpdateSubmission } from '../../definitions/schemas/validation/updateSubmission';
import { ValidObjectId } from '../../definitions/schemas/validation/validObjectId';
import { Submission } from '../../definitions/schemas/mongoose/submission';
import { Vote } from '../../definitions/schemas/mongoose/vote';
import { Comment } from '../../definitions/schemas/mongoose/comment';
import { voteOn, unvoteOn } from '../../definitions/schemas/mongoose/vote';
import { upload } from '../../server';

const submissionRouter = Router();

/**
 * @openapi
 * /submission/{id}:
 *   get:
 *     summary: Return information about a submission.
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Resource successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Submission'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500'
 */
submissionRouter.get('/:id', async (req, res) => {
  const submissionId = req.params.id;
  const query = Submission.findById(submissionId);

  const numCommentsQuery = Comment.countDocuments({ post: submissionId });
  const numVotesQuery = Vote.countDocuments({ post: submissionId });

  const commentedOnQuery = Comment.findOne({ post: submissionId,
                                             author: req.session.userId });
  const votedOnQuery = Vote.findOne({ post: submissionId,
                                      author: req.session.userId });
  try {
    let result = await query
                         .populate('author')
                         .populate('post', ['deadline'])
                         .lean()
                         .exec();
    if (result) {
      /* Found submission matching submissionId.  */
      const numComments = await numCommentsQuery.exec();
      const numVotes = await numVotesQuery.exec();

      let commentedOn, votedOn = null;
      if (mongoose.Types.ObjectId.isValid(req.session.userId || '')) {
        commentedOn = !!(await commentedOnQuery.lean().exec());
        votedOn = !!(await votedOnQuery.lean().exec());
      }
      result = {
        ...result,
        ...{
          numComments: numComments,
          commentedOn: commentedOn,
          numVotes: numVotes,
          votedOn: votedOn
        }
      };
      res.status(200).json(result);
    } else {
      /* Did not find a submission with matching submissionId.  */
      res.status(404).send('Invalid submission id.');
    }
  } catch (err) {
    res.status(500).send('Internal server error.');
    console.error(err);
  }
});

/**
 * @openapi
 * /submission/{id}:
 *   put:
 *     summary: Update submission information if user is the creator.
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       description: Submission information to be updated.
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               caption:
 *                 type: string
 *             required:
 *               - caption
 *     responses:
 *       200:
 *         description: Successfully updated submission.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Submission'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500'
 */
submissionRouter.put(
  '/:id',
  upload.none(),
  checkSchema({...ValidObjectId, ...UpdateSubmission}),
  async (req: Request, res: Response) => {
    if (!req.session.loggedIn) {
      res.status(401).send('Not logged in.');
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

    const submissionId = req.params['id'];
    const query = Submission.findById(submissionId);
    try {
      const result = await query.exec();
      if (!result) {
        /* Did not find a submission with matching submissionId. */
        res.status(404).send('Invalid submission id.');
        return;
      }

      if (result.author.toString() !== req.session.userId) {
        /* User is not the owner of the resource.  */
        res.status(403).send('Access to that resource is forbidden');
        return;
      }

      const body = matchedData(req);
      const updatedSubmission = await Submission.findByIdAndUpdate(
        submissionId,
        { $set: body },
        { new: true }
      ).exec();

      res.status(200).json(updatedSubmission);
    } catch (err) {
      res.status(500).send('Internal server error.');
      console.error(err);
    }
  }
);

/**
 * @openapi
 * /submission/{id}/vote:
 *   put:
 *     summary: Like a submission.
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Successfully voted on the submission.
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 *       500:
 *         $ref: '#/components/responses/500'
 */
submissionRouter.put('/:id/vote', upload.none(), checkSchema(ValidObjectId), async (req: Request, res: Response) => {
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

  const submissionId = req.params['id'];
  if (!submissionId) {
    res.status(404).send('Resource not found.');
    return;
  }
  const query = Submission.findById(submissionId);
  try {
    const result = await query.lean().exec();
    if (!result) {
      res.status(404).send('Resource not found.');
      return;
    }

    await voteOn('Submission', submissionId, req.session.userId);
    res.status(200).send('Successfully voted on submission.');
  } catch (err) {
    res.status(500).send('Internal server error.');
    console.error(err);
  }
});

/**
 * @openapi
 * /submission/{id}/unvote:
 *   put:
 *     summary: Unvote a submission.
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Successfully unvoted the submission.
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 *       500:
 *         $ref: '#/components/responses/500'
 */
submissionRouter.put('/:id/unvote', upload.none(), checkSchema(ValidObjectId), async (req: Request, res: Response) => {
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

  const submissionId = req.params['id'];
  if (!submissionId) {
    res.status(404).send('Resource not found.');
    return;
  }
  const query = Submission.findById(submissionId);
  try {
    const result = await query.lean().exec();
    if (!result) {
      res.status(404).send('Resource not found.');
      return;
    }

    await unvoteOn('Submission', submissionId, req.session.userId);
    res.status(200).send('Successfully unvoted on submission.');
  } catch (err) {
    res.status(500).send('Internal server error.');
    console.error(err);
  }
});

/**
 * @openapi
 * /submission/{id}/comments:
 *   get:
 *     summary: Retrieve comments for submission.
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
submissionRouter.get('/:id/comments', upload.none(), checkSchema(ValidObjectId), async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(404).json({
      errors: errors.array(),
    });
    return;
  }

  const submissionId = req.params['id'];
  const query = Comment.find({
    commentedModel: 'Submission',
    post: submissionId,
  }).populate('author').populate('post', [
    '-author',
    '-__v'
  ]);
  try {
    const result = await query.lean().exec();
    if (result) {
      /* Found comments on submission. */
      res.status(200).json(result);
    } else {
      /* Did not find a submission with matching submissionId. */
      res.status(404).send('Invalid submission id.');
    }
  } catch (err) {
    res.status(500).send('Internal server error.');
    console.error(err);
  }
});

/**
 * @openapi
 * /submission/{id}/comment:
 *   post:
 *     summary: Creating new comment by a user on a submission.
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
 *         description: Successfully commented on submission.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500'
 */
submissionRouter.post('/:id/comment', upload.none(), checkSchema(ValidObjectId), async (req: Request, res: Response) => {
  if (!req.session.loggedIn) {
    res.status(401).send('Not logged in.');
    return;
  }

  if (req.body.comment === '') {
    res.status(400).send('Missing information to create a new comment.');
    return;
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(404).json({
      errors: errors.array(),
    });
    return;
  }

  const submissionId = req.params['id'];
  try {
    const newComment = await Comment.create({
      author: req.session.userId,
      commentedModel: 'Submission',
      post: submissionId,
      caption: req.body.comment,
    });
    res.status(200).json(newComment);
  } catch (err) {
    res.status(500).send('Internal server error.');
    console.error(err);
  }
});

/**
 * @openapi
 * /submission/{id}:
 *   delete:
 *     summary: Delete submission if user is the submission owner.
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Successfully deleted submission.
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500'
 */
submissionRouter.delete('/:id', upload.none(), checkSchema(ValidObjectId), async (req: Request, res: Response) => {
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

  const submissionId = req.params['id'];
  /* Delete submission.  */
  const query = Submission.findOneAndDelete({
    _id: submissionId,
    author: req.session.userId,
  });
  try {
    const submissionObj = await query.lean().exec();
    if (!submissionObj) {
      res.status(404).send('Failed to find submission.');
      console.error('Failed to find submission.');
    } else {
      res.status(200).send('Successfully deleted submission.');
    }
  } catch (err) {
    res.status(500).send('Internal server error.');
    console.error(err);
  }
});

export { submissionRouter };
