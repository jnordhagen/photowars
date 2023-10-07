import { fakeUsers } from "../../../../users";

const comments = [
  {
    author: fakeUsers[2]!._id,
    caption: 'Obama looking disturbingly relaxed there.',
    votes: []
  },
  {
    author: fakeUsers[3]!._id,
    caption: 'This one works REALLY well. lmao',
    votes: []
  }
] as any;

export { comments };