import { fakeUsers } from "../../../../users";

const comments = [
  {
    author: fakeUsers[4]!._id,
    caption: 'I can hear this',
    votes: []
  },
  {
    author: fakeUsers[0]!._id,
    caption: 'You gave it a little Tusken headdress instead of shopping the crab to be a Tusken Raider\'s head, I\'m dying of cuteness!',
    votes: []
  }
] as any;

export { comments };