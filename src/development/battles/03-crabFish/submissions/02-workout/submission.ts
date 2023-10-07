import { fakeUsers } from "../../../../users";

const submission = {
  author: fakeUsers[2]!._id,
  caption: 'nothin like a little workout session',
  votes: [fakeUsers[0]]
};

export { submission };