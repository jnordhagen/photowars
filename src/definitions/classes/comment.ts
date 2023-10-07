import { BattleFrontend } from "./battle";
import { Post } from "./post";
import { SubmissionFrontend } from "./submission";
import { UserFrontend } from "./user";
import { VoteStats } from "./vote";

class CommentShared extends Post {
  post: string | Post;
  constructor() {
    super();
    this.post = '';
  }
}

class CommentBackend extends CommentShared {
  override post: string;
  constructor() {
    super();
    this.post = '';
  }
}

class CommentFrontend extends CommentShared {
  _id: string;
  __v?: number;
  override author: string;
  commentedModel: string;

  constructor() {
    super();
    this._id = '';
    this.__v = 0;
    this.author = '';
    this.commentedModel = '';
  }
}

class PopulatedCommentFrontend extends CommentShared {
  _id: string;
  __v?: number;
  override author: UserFrontend;
  commentedModel: string;
  override post: SubmissionFrontend | BattleFrontend;

  constructor() {
    super();
    this._id = '';
    this.__v = 0;
    this.author = new UserFrontend();
    this.commentedModel = '';
    this.post = new BattleFrontend();
  }
}

class CommentStats {
  numComments: number;
  commentedOn: boolean | null;

  constructor() {
    this.numComments= 0;
    this.commentedOn = false;
  }
}

type CommentCardInfo = PopulatedCommentFrontend
                       & VoteStats

export { CommentBackend, CommentCardInfo, CommentFrontend, PopulatedCommentFrontend, CommentStats };