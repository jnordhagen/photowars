class UserShared {
  description: string;
  displayName: string;
  filename: string;
  firstName: string;
  lastName: string;

  constructor() {
    this.description = '';
    this.displayName = '';
    this.filename = '';
    this.firstName = '';
    this.lastName = '';
  }
}

class UserBackend extends UserShared {
  loginName: string;
  loginPassword: string;

  constructor() {
    super();
    this.loginName = '';
    this.loginPassword = '';
  }
}

class UserFrontend extends UserShared {
  _id: string;
  __v?: number;

  constructor() {
    super();
    this._id = '';
    this.__v = 0;
  }
}

export { UserBackend, UserFrontend };