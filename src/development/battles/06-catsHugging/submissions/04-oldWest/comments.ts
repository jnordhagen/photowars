import { fakeUsers } from "../../../../users";

const comments = [
  {
    author: fakeUsers[1]!._id,
    caption: `Yin yang`,
    votes: []
  },
  {
    author: fakeUsers[0]!._id,
    caption: 'My favorite!',
    votes: []
  }
] as any;

export { comments };