import { UserFrontend } from "../definitions/classes/user";

/* Fake users.  */
const user0 = {
  _id: '000000000000000000000e00',
  description: "I'm Spiderman!",
  displayName: 'Spidey',
  filename: 'seagull.jpg',
  firstName: 'Tom',
  lastName: 'Holland',
  loginName: 'ab',
  loginPassword: 'ab',
};

const user1 = {
  _id: '000000000000000000000e01',
  description: 'I do all of my stunts!',
  displayName: 'RushHour',
  filename: 'seagull.jpg',
  firstName: 'Jackie',
  lastName: 'Chan',
  loginName: 'bc',
  loginPassword: 'bc',
};

const user2 = {
  _id: '000000000000000000000e02',
  description: 'Unholy is the best song',
  displayName: 'Sammy',
  filename: 'seagull.jpg',
  firstName: 'Sam',
  lastName: 'Smith',
  loginName: 'cd',
  loginPassword: 'cd',
};

const user3 = {
  _id: '000000000000000000000e03',
  description: "I'm deadpool",
  displayName: 'Deadpool',
  filename: 'seagull.jpg',
  firstName: 'Ryan',
  lastName: 'Reynolds',
  loginName: 'de',
  loginPassword: 'de',
};

const user4 = {
  _id: '000000000000000000000e04',
  description: 'La La La La Land',
  displayName: 'Emmaaa',
  filename: 'seagull.jpg',
  firstName: 'Emma',
  lastName: 'Stone',
  loginName: 'ef',
  loginPassword: 'ef',
};

const fakeUsers: UserFrontend[] = [user0, user1, user2, user3, user4];

export { fakeUsers };