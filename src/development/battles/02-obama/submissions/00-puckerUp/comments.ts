import { fakeUsers } from "../../../../users";

const comments = [
  {
    author: fakeUsers[4]!._id,
    caption: 'A minor edit, but a well appreciated one',
    votes: []
  },
  {
    author: fakeUsers[0]!._id,
    caption: 'Spin the damn bottle.',
    votes: []
  }
] as any;

export { comments };