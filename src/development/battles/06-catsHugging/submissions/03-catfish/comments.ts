import { fakeUsers } from "../../../../users";

const comments = [
  {
    author: fakeUsers[3]!._id,
    caption: `Took me a second wow`,
    votes: []
  }
] as any;

export { comments };