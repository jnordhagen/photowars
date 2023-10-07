import { fakeUsers } from "../../../../users";

const comments = [
  {
    author: fakeUsers[2]!._id,
    caption: `Pennywise Buffet`,
    votes: []
  },
  {
    author: fakeUsers[3]!._id,
    caption: `With enough balloons you'll float too!`,
    votes: []
  }
] as any;

export { comments };