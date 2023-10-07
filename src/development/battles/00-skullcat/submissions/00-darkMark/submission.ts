import { fakeUsers } from "../../../../users";

const submission = {
  author: fakeUsers[0]!._id,
  caption: 'The Dark Mark',
  votes: [fakeUsers[1]],
};

export { submission };