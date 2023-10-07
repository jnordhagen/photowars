import { fakeUsers } from "../../../../users";

const comments = [
  {
    author: fakeUsers[2]!._id,
    caption: 'Talk about living up to the family name.',
    votes: []
  },
  {
    author: fakeUsers[3]!._id,
    caption: 'This is my favorite one',
    votes: []
  }
] as any;

export { comments };