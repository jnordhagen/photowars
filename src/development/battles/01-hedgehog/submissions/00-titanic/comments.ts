import { fakeUsers } from "../../../../users";

const comments = [
  {
    author: fakeUsers[4]!._id,
    caption: 'This made my day. Cheers',
    votes: []
  },
  {
    author: fakeUsers[0]!._id,
    caption: 'Omg I dont know if to upvote or downvote this... Titanic is my favorite movie but I hate the whole "is there enough room" argument...',
    votes: []
  }
] as any;

export { comments };