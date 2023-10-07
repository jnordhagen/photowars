import { UserFrontend } from "./user";

class Post {
  author: string | UserFrontend;
  caption: string;
  creationTime: string;

  constructor() {
    this.author = '';
    this.caption = '';
    this.creationTime = '';
  }
}

export { Post };
