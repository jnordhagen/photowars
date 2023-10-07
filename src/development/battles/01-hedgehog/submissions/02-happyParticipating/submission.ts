import { fakeUsers } from "../../../../users";

const submission = {
  author: fakeUsers[2]!._id,
  caption: "He's just happy to be participating",
  votes: [fakeUsers[0]]
};

export { submission };