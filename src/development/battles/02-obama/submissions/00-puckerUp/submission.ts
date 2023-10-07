import { fakeUsers } from "../../../../users";

const submission = {
  author: fakeUsers[0]!._id,
  caption: 'Pucker Up, Steph',
  votes: [fakeUsers[0], fakeUsers[2]]
};

export { submission };