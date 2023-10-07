import { fakeUsers } from "../../../../users";

const comments = [
  {
    author: fakeUsers[4]!._id,
    caption: 'Now someone just needs to shop Daniel as Spidey and we\'ll be squared away',
    votes: []
  },
  {
    author: fakeUsers[0]!._id,
    caption: "I'm something of a polka player myself",
    votes: []
  },
  {
    author: fakeUsers[3]!._id,
    caption: `And he's ridin around on that glider thing,
    and he's throwin' that weird pumpkin bomb.
    Yeah, he's wearing' that dumb power ranger mask,
    but he's scarier without it on.`,
    votes: []
  }
] as any;

export { comments };