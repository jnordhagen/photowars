import { fakeUsers } from "../../../../users";

const submission = {
  author: fakeUsers[0]!._id,
  caption: `I'm no wizard but you get the idea.`,
  votes: [fakeUsers[0]]
};

export { submission };