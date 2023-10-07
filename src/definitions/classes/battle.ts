import { CommentStats } from "./comment";
import { Post } from "./post";
import { SubmissionStats } from "./submission";
import { UserFrontend } from "./user";
import { VoteStats } from "./vote";

class BattleShared extends Post {
  deadline: string;
  filename: string;

  constructor() {
    super();
    this.deadline = '';
    this.filename = '';
  }
}

class BattleFrontend extends BattleShared {
  _id: string;
  __v?: number;
  override author: string;

  constructor() {
    super();
    this._id = '';
    this.__v = 0;
    this.author = '';
  }
}

class PopulatedBattleFrontend extends BattleShared {
  _id: string;
  __v?: number;
  override author: UserFrontend;

  constructor() {
    super();
    this._id = '';
    this.__v = 0;
    this.author = new UserFrontend();
  }
}

type BattleCardInfo = PopulatedBattleFrontend
                      & CommentStats
                      & SubmissionStats
                      & VoteStats


export { BattleCardInfo, BattleFrontend, PopulatedBattleFrontend };