"use strict"

import { User } from '../mongoose/user';

const UpdateUser = {
  description: {},
  displayName: {
    isLength: {
      options: {
        min: 3
      },
    },
    displayNameNotInUse: {
      // eslint-disable-next-line
      custom: async (displayName: string, { req }: any) => {
        const userId = req.session.userId;
        const query = User.findOne({ 
          displayName: displayName
        });
        const userObj = await query.lean().exec();
        if (userObj && userObj._id.toString() !== userId) {
          return Promise.reject();
        }
        return Promise.resolve();
      },
      errorMessage: 'Display name already in use.'
    }
  },
  firstName: {},
  lastName: {}
}

export { UpdateUser };
