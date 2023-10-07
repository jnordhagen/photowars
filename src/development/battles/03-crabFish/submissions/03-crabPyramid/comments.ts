import { fakeUsers } from "../../../../users";

const comments = [
  {
    author: fakeUsers[1]!._id,
    caption: 'This is the closest thing to the crab rave edit I was looking for 🦀🦀🦀',
    votes: []
  },
  {
    author: fakeUsers[3]!._id,
    caption: 'Pyramid scheme',
    votes: []
  }
] as any;

export { comments };