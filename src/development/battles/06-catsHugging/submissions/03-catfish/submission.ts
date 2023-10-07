import { fakeUsers } from "../../../../users";

const submission = {
  author: fakeUsers[0]!._id,
  caption: `catfish`,
  votes: [fakeUsers[0]]
};

export { submission };