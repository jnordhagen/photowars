import { fakeUsers } from "../../../../users";

const comments = [
  {
    author: fakeUsers[3]!._id,
    caption: 'Now you need to make one of Hamlet',
    votes: [fakeUsers[0]]
  },
  {
    author: fakeUsers[4]!._id,
    caption: 'The Pirates of the Catribbean: The pussy is scared',
    votes: []
  }
] as any;

export { comments };