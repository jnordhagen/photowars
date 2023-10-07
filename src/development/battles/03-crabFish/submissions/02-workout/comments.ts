import { fakeUsers } from "../../../../users";

const comments = [
  {
    author: fakeUsers[0]!._id,
    caption: 'Lmao this is a good one',
    votes: []
  },
  {
    author: fakeUsers[4]!._id,
    caption: 'Livin like Larrrrry',
    votes: []
  }
] as any;

export { comments };