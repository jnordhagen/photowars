"use strict"

const UpdateBattle = {
  caption: {
    optional: {
      options: {
        checkFalsy: true
      }
    },
  },
  deadline: {
    optional: {
      options: {
        checkFalsy: true
      }
    },
    isISO8601: {
      errorMessage: 'Must be a valid date.'
    }
  }
}

export { UpdateBattle };
