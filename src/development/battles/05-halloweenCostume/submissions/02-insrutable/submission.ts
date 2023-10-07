import { fakeUsers } from "../../../../users";

const submission = {
  author: fakeUsers[2]!._id,
  caption: '',
  votes: [fakeUsers[4]]
};

export { submission };