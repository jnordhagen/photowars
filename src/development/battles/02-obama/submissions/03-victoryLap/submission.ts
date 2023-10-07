import { fakeUsers } from "../../../../users";

const submission = {
  author: fakeUsers[3]!._id,
  caption: 'NeverEnding Victory Lap',
  votes: [fakeUsers[0]]
};

export { submission };