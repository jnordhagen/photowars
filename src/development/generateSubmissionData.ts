import * as fs from 'fs/promises';
import async = require('async');
import path = require('path');
import { getLocalISOString, moveImagesToPublic } from './loadDatabase';
import { generateComment } from './generateCommentData';
import { Submission } from '../definitions/schemas/mongoose/submission';
import { uploadFileToS3 } from '../definitions/s3';

/* Get constants.  */
import dotenv = require('dotenv');
import { Vote } from '../definitions/schemas/mongoose/vote';
import { UserFrontend } from '../definitions/classes/user';
dotenv.config();

async function generateSubmissionData(this: any, pathToSubmission: string, callback: any) {
  const model = 'Submission';
  const battleIdx = this.battleId.slice(-2);
  const postIdx = pathToSubmission.replace(/^\/*|\/*$/g, '').split('/').slice(-1)[0]!.slice(0, 2);
  const commentPrefix = `0000000000000000b${battleIdx}a${postIdx}`;
  const postId = `000000000000000000b${battleIdx}a${postIdx}`;
  const dir = await fs.opendir(pathToSubmission);
  for await (const entry of dir) {
    switch (entry.name) {
      case 'image': {
        const { submission } = await import(path.join(pathToSubmission, 'submission'));
        const imageDir = await fs.readdir(path.join(pathToSubmission, entry.name));
        for (const imageName of imageDir) {
          /* Should only be one image here.  */
          submission.filename = imageName;
          if (process.env['IMAGE_DIR']) {
            await uploadFileToS3({
              path: path.join(pathToSubmission, 'image', submission.filename),
              filename: submission.filename
            });
            console.log(`Uploaded file ${submission.filename} to Amazon S3.`);
          } else {
            await moveImagesToPublic(path.join(pathToSubmission, 'image'), submission.filename);
          }
        }
        submission.post = this.battleId;
        submission._id = postId;
        submission.creationTime = getLocalISOString(new Date());
        try {
          await async.eachOf(submission.votes, async (voter: UserFrontend, index: any, callback) => {
            let voteIdx = index.toString();
            if (index <= 9) voteIdx = '0' + voteIdx; // Turns '9' into '09'
            await Vote.create({
              _id: `${postId.slice(3)}d${voteIdx}`,
              author: voter._id,
              creationTime: getLocalISOString(new Date()),
              post: postId,
              votedModel: 'Submission'
            })
            callback();
          });
          await Submission.create(submission);
        } catch (err) {
          console.log(err);
        }
        break;
      }

      case 'comments.ts': {
        const { comments } = await import(path.join(pathToSubmission, 'comments'))
        try {
          const generateCommentBind = generateComment.bind({
            model: model,
            postId: postId,
            commentPrefix: commentPrefix
          });
          await async.eachOf(comments, generateCommentBind);
        } catch (err) {
          console.error(err);
        }
        break;
      }
    }
  }
  callback();
}

const generateSubmissionsData = async (pathToSubmissions: string, battleId: string) => {
  try {
    let submissionNames = await fs.readdir(pathToSubmissions);
    submissionNames = submissionNames.map((sName) => path.join(pathToSubmissions, sName));
    await async.each(submissionNames, generateSubmissionData.bind({battleId: battleId}));
  } catch (err) {
    console.error(err);
  }
};

export { generateSubmissionsData };