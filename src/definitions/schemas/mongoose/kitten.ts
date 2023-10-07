"use strict"

import mongoose = require('mongoose');

/**
 * @openapi
 * components:
 *   schemas:
 *     Kitten:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         __v:
 *           type: number
 *         name:
 *           type: string
 *         creation_time:
 *           type: string
 *           format: date-time
 */
const kittenSchema = new mongoose.Schema({
  name: String,
  creation_time: { type: Date, default: Date.now }
});

const Kitten = mongoose.model('Kitten', kittenSchema);

export { Kitten };
