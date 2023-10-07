import { fakeUsers } from "../../../../users";

const comments = [
  {
    author: fakeUsers[4]!._id,
    caption: `very cool. looking at the original image all i can see now is a mouth and a nostril lol`,
    votes: []
  },
  {
    author: fakeUsers[0]!._id,
    caption: `Bruh this is way too good.`,
    votes: []
  }
] as any;

export { comments };