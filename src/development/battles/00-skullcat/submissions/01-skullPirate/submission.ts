import { fakeUsers } from "../../../../users";

const submission = {
  author: fakeUsers[1]!._id,
  caption: 'Old Skull Pirate Holding Skull',
  votes: [fakeUsers[2], fakeUsers[3]]
};


export { submission };