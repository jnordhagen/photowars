import { fakeUsers } from "../../../../users";

const submission = {
  author: fakeUsers[0]!._id,
  caption: "Titanic 2: There's Room For Everyone!",
  votes: [fakeUsers[4]]
};

export { submission };