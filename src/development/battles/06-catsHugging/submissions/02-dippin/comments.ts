import { fakeUsers } from "../../../../users";

const comments = [
  {
    author: fakeUsers[1]!._id,
    caption: `This needs to be an Oreo ad lol`,
    votes: []
  },
  {
    author: fakeUsers[0]!._id,
    caption: 'That Seinfeld cookie, well done.',
    votes: []
  }
] as any;

export { comments };