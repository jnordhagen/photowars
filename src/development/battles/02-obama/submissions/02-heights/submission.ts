import { fakeUsers } from "../../../../users";

const submission = {
  author: fakeUsers[2]!._id,
  caption: "Curry doesn't like heights...",
  votes: [fakeUsers[0]]
};

export { submission };