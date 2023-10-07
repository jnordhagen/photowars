import { fakeUsers } from "../../../../users";

const comments = [
  {
    author: fakeUsers[1]!._id,
    caption: 'This one is my favorite lol so good!',
    votes: []
  },
  {
    author: fakeUsers[2]!._id,
    caption: 'This is legit my favourite entry in this sub yet',
    votes: [fakeUsers[1]]
  }
] as any;

export { comments };