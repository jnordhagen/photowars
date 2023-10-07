import { fakeUsers } from "../../../../users";

const comments = [
  {
    author: fakeUsers[3]!._id,
    caption: `René Magritte vibes.`,
    votes: []
  },
  {
    author: fakeUsers[4]!._id,
    caption: `Some people think they are limited by what they can or can't do.
    This person just runs with it, and I applaud you.`,
    votes: []
  }
] as any;

export { comments };