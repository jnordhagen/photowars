import { fakeUsers } from "../../../../users";

const comments = [
  {
    author: fakeUsers[1]!._id,
    caption: `I'm waiting for the Michael Bay edit`,
    votes: []
  },
  {
    author: fakeUsers[0]!._id,
    caption: 'They could make a movie from that.',
    votes: []
  }
] as any;

export { comments };