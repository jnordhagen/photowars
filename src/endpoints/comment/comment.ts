"use strict"

import mongoose = require('mongoose');
import { Request, Response, Router } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import { Comment } from '../../definitions/schemas/mongoose/comment';
import { ValidObjectId } from '../../definitions/schemas/validation/validObjectId';
import { Vote, voteOn, unvoteOn } from '../../definitions/schemas/mongoose/vote';
import { upload } from '../../server';

const commentRouter = Router();

/**
 * @openapi
 * /comment/{id}:
 *   get:
 *     summary: Get comment information.
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Resource successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500'
*/
commentRouter.get('/:id', async (req, res) => {
  const commentId = req.params.id;
  const query = Comment.findById(commentId, [
    '-__v'
  ]).populate('post', [
    '-__v'
  ]);
  const numVotesQuery = Vote.countDocuments({ post: commentId });
  const votedOnQuery = Vote.findOne({ post: commentId,
                                      author: req.session.userId });

  try {
    let result = await query.lean().exec();
    const numVotes = await numVotesQuery.exec();

    let votedOn = null;
    if (mongoose.Types.ObjectId.isValid(req.session.userId || '')) {
      votedOn = !!(await votedOnQuery.lean().exec());
    }
    if (result) {
      /* Found comment with id.  */
      result = {
        ...result,
        ...{
          numVotes: numVotes,
          votedOn: votedOn
        }
      };
      res.status(200).json(result);
    } else {
      /* Did not find comment with id.  */
      res.status(404).send(`Comment with ID ${commentId} not found.`);
    }
  } catch (err) {
    res.status(500).send('Internal server error.');
    console.error('Failed to query database.');
  }
});

/**
 * @openapi
 * /comment/{id}:
 *   delete:
 *     summary: Delete comment if user is the comment owner.
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Successfully deleted comment.
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500'
 */
commentRouter.delete('/:id', upload.none(), checkSchema(ValidObjectId), async (req: Request, res: Response) => {
  if (!req.session.loggedIn) {
    res.status(401).send('User is not logged in.');
    return;
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(404).json({
      errors: errors.array(),
    });
    return;
  }

  const commentId = req.params['id'];
  const query = Comment.findById(commentId);

  try {
    const result = await query.exec();
    if (!result) {
      /* Did not find comment with id.  */
      res.status(404).send(`Comment with ID ${commentId} not found.`);
    } else if (req.session.userId !== result.author.toString()) {
      /* User requesting change is not the comment's author.  */
      res.status(403).send('User is not the comment author.');
    } else {
      await Comment.findByIdAndUpdate(commentId,
                                      {
                                        author: '000000000000000000000000',
                                        caption: ''
                                      });
      res.status(200).send('Successfully deleted comment caption.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error.');
  }
});

/**
 * @openapi
 * /comment/{id}:
 *   put:
 *     summary: Updating a comment by a user.
 *     requestBody:
 *       description: Comment object.
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
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Successfully updated user comment.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500'
 */
commentRouter.put('/:id', upload.none(), checkSchema(ValidObjectId), async (req: Request, res: Response) => {
  if (!req.session.loggedIn) {
    res.status(401).send('User is not logged in.');
    return;
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(404).json({
      errors: errors.array(),
    });
    return;
  }

  const commentId = req.params['id'];
  const query = Comment.findById(commentId);

  try {
    const result = await query.exec();
    if (!result) {
      /* Did not find comment with id.  */
      res.status(404).send(`Comment with ID ${commentId} not found.`);
    } else if (req.session.userId !== result.author.toString()) {
      /* User requesting change is not the comment's author.  */
      res.status(403).send('User is not the comment author.');
    } else {
      result.caption = req.body.caption;
      const updatedComment = await result.save();
      res.status(200).send(updatedComment);
    }
  } catch (err) {
    res.status(500).send('Internal server error.');
  }
});

/**
 * @openapi
 * /comment/{id}/vote:
 *   put:
 *     summary: Vote on a comment.
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Successfully voted on the comment.
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500'
 */
commentRouter.put('/:id/vote', upload.none(), checkSchema(ValidObjectId), async (req: Request, res: Response) => {
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

  const commentId = req.params['id'];
  if (!commentId) {
    res.status(404).send('Resource not found.');
    return;
  }
  const query = Comment.findOne({ _id: commentId });
  try {
    const result = await query.lean().exec();
    if (!result) {
      res.status(404).send('Resource not found.');
      return;
    }

    await voteOn('Comment', commentId, req.session.userId);
    console.log("Successfully voted on");
    res.status(200).send('Successfully voted on comment.');

  } catch (err) {
    res.status(500).send('Internal server error.');
    console.error(err);
  }
});

/**
 * @openapi
 * /comment/{id}/unvote:
 *   put:
 *     summary: Unvote a comment.
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Successfully unvoted the comment.
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500'
 */
commentRouter.put('/:id/unvote', upload.none(), checkSchema(ValidObjectId), async (req: Request, res: Response) => {
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

  const commentId = req.params['id'];
  if (!commentId) {
    res.status(404).send('Resource not found.');
    return;
  }
  const query = Comment.findOne({ _id: commentId });
  try {
    const result = await query.lean().exec();
    if (!result) {
      res.status(404).send('Resource not found.');
      return;
    }

    await unvoteOn('Comment', commentId, req.session.userId);
    res.status(200).send('Successfully unvoted comment.');

  } catch (err) {
    res.status(500).send('Internal server error.');
    console.error(err);
  }
});

export { commentRouter };
