"use strict"

import mongoose = require('mongoose');
import { Request, Response, Router } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import { ValidObjectId } from '../../definitions/schemas/validation/validObjectId';
import { Vote } from '../../definitions/schemas/mongoose/vote';
import { upload } from '../../server';

const voteRouter = Router();

/**
 * @openapi
 * /vote/{id}:
 *   get:
 *     summary: Get vote for a post.
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Resource successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 numVotes:
 *                   type: number
 *                 votedOn:
 *                   type: boolean
 *       500:
 *         $ref: '#/components/responses/500'
*/
voteRouter.get('/:id', upload.none(), checkSchema(ValidObjectId), async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(404).json({
      errors: errors.array(),
    });
    return;
  }
  const voteModelId = req.params['id'];
  const numVotesQuery = Vote.countDocuments({ post: voteModelId });
  const votedOnQuery = Vote.findOne({ post: voteModelId, author: req.session.userId });

  try {
    const numVotes = await numVotesQuery.exec();

    let votedOn = null;
    if (mongoose.Types.ObjectId.isValid(req.session.userId || '')) {
      votedOn = !!(await votedOnQuery.lean().exec());
    }
    res.status(200).json({ numVotes: numVotes, votedOn: votedOn });
  } catch (err) {
    res.status(500).send('Internal server error.');
    console.error(err);
  }
});

export { voteRouter };
