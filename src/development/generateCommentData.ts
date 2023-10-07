import async = require('async');
import { getLocalISOString } from "./loadDatabase";
import { Comment } from "../definitions/schemas/mongoose/comment";
import { UserFrontend } from '../definitions/classes/user';
import { Vote } from '../definitions/schemas/mongoose/vote';

async function generateComment(this: any, comment: any, index: any, callback: any) {
  let commentIdx = index.toString();
  if (index <= 9) commentIdx = '0' + commentIdx; // Turns '9' into '09'

  /* Set _id.  */
  const postId = this.commentPrefix + commentIdx;
  comment._id = postId;

  /* Set creationTime.  */
  comment.creationTime = getLocalISOString(new Date());

  /* Set type of post.  */
  comment.commentedModel = this.model;

  /* Set post id.  */
  comment.post = this.postId;

  try {
    await async.eachOf(comment.votes, async (voter: UserFrontend, index: any, callback) => {
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
    await Comment.create(comment);
    console.log(`Added comment "${comment.caption}" to database.`)
  } catch (err) {
    console.error(err);
  }
  callback();
}

export { generateComment };