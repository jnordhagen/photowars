import { fakeUsers } from "../../../../users";

const submission = {
  author: fakeUsers[2]!._id,
  caption: 'Ralcliff the Insrutable',
  votes: [fakeUsers[4]]
};

export { submission };