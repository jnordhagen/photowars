import { fakeUsers } from "../../../../users";

const comments = [
  {
    author: fakeUsers[2]!._id,
    caption: 'Love the lighting',
    votes: []
  },
  {
    author: fakeUsers[3]!._id,
    caption: 'Weird Science.',
    votes: []
  }
] as any;

export { comments };