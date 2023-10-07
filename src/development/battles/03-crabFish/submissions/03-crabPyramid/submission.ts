import { fakeUsers } from "../../../../users";

const submission = {
  author: fakeUsers[4]!._id,
  caption: 'Crab pyramid',
  votes: [fakeUsers[0]]
};

export { submission };