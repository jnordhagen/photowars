"use strict"

import mongoose = require('mongoose');

const ValidObjectId = {
  id: {
    isMongooseObjectId: {
      custom: (id: string) => {
        return mongoose.Types.ObjectId.isValid(id);
      },
      errorMessage: 'Invalid id.'
    }
  }
}

export { ValidObjectId };
