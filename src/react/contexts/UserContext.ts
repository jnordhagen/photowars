import React from 'react';
import { createContext } from 'react';

class LoggedInUser {
  _id: string;
  description: string;
  displayName: string;
  filename: string;
  firstName: string;
  lastName: string;

  constructor() {
    this._id = '';
    this.description = '';
    this.displayName = '';
    this.filename = '';
    this.firstName = '';
    this.lastName = '';
  }
}

interface IUserContext {
  openLoginModal: boolean;
  setOpenLoginModal: React.Dispatch<React.SetStateAction<boolean>> | null;
  loggedInUser: LoggedInUser;
  setLoggedInUser: React.Dispatch<React.SetStateAction<LoggedInUser>> | null;
  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>> | null;
}

const UserContext = createContext<IUserContext>({
  openLoginModal: false,
  setOpenLoginModal: null,
  loggedInUser: new LoggedInUser(),
  setLoggedInUser: null,
  sortBy: 'New',
  setSortBy: null,
});

export { LoggedInUser, UserContext };
