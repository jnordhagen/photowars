import { fakeUsers } from "../../../../users";

const comments = [
  {
    author: fakeUsers[2]!._id,
    caption: 'One of my favs!.',
    votes: []
  },
  {
    author: fakeUsers[3]!._id,
    caption: 'This was 100% my immediate thought, but just the crab with the boombox. This was executed soooo much better than I could have anticipated. Great work!',
    votes: []
  }
] as any;

export { comments };