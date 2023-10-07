import { BattleFrontend } from "./battle";
import { CommentStats } from "./comment";
import { Post } from "./post";
import { UserFrontend } from "./user";
import { VoteStats } from "./vote";

class SubmissionShared extends Post {
  filename: string;
  post: string | BattleFrontend;

  constructor() {
    super();
    this.filename = '';
    this.post= '';
  }
}

class SubmissionFrontend extends SubmissionShared {
  _id: string;
  __v?: number;
  override author: string;
  override post: string;

  constructor() {
    super();
    this._id = '';
    this.__v = 0;
    this.author = '';
    this.post = '';
  }
}

class PopulatedSubmissionFrontend extends SubmissionShared {
  _id: string;
  __v?: number;
  override author: UserFrontend;
  override post: BattleFrontend;

  constructor() {
    super();
    this._id = '';
    this.__v = 0;
    this.author = new UserFrontend();
    this.post = new BattleFrontend();
  }
}

class SubmissionStats {
  numSubmissions: number;
  submittedTo: boolean | null;

  constructor() {
    this.numSubmissions = 0;
    this.submittedTo = false;
  }
}

type SubmissionCardInfo = PopulatedSubmissionFrontend
                          & CommentStats
                          & VoteStats;

export { SubmissionCardInfo, PopulatedSubmissionFrontend, SubmissionFrontend, SubmissionStats };