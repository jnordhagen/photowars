import { fakeUsers } from "../../../../users";

const comments = [
  {
    author: fakeUsers[4]!._id,
    caption: `Whoa dude that's amazing`,
    votes: []
  },
  {
    author: fakeUsers[0]!._id,
    caption: "Beautiful. ❤️",
    votes: []
  }
] as any;

export { comments };