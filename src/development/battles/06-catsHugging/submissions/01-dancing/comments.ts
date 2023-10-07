import { fakeUsers } from "../../../../users";

const comments = [
  {
    author: fakeUsers[2]!._id,
    caption: `Not the avatar reference I expected, but I love it! (Was expecting someone to do Tui and La)`,
    votes: []
  },
  {
    author: fakeUsers[3]!._id,
    caption: `"My mother loved photoshop battles..."`,
    votes: []
  }
] as any;

export { comments };