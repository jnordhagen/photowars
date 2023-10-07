import { fakeUsers } from "../../users";

const battle = {
  author: fakeUsers[0]!._id,
  caption: 'This cat with a skull on his chest',
  deadline: '2023-06-25T00:26:13.696Z',
  votes: [fakeUsers[1]]
};

export { battle };