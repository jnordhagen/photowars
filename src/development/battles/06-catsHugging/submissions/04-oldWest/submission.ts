import { fakeUsers } from "../../../../users";

const submission = {
  author: fakeUsers[4]!._id,
  caption: `Old West`,
  votes: [fakeUsers[4]]
};

export { submission };