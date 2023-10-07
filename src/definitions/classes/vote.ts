class VoteShared {
  author: string;
  creationTime: string;
  post: string;
  votedModel: string

  constructor() {
    this.author = '';
    this.creationTime = '';
    this.post = '';
    this.votedModel = '';
  }
}

class VoteBackend extends VoteShared {

}

class VoteFrontend extends VoteShared {
  _id: string;
  __v?: number;

  constructor() {
    super()
    this._id = '';
    this.__v = 0;
  }
}

class VoteStats {
  numVotes: number;
  votedOn: boolean | null;

  constructor() {
    this.numVotes = 0;
    this.votedOn = false;
  }
}

export { VoteBackend, VoteFrontend, VoteStats }