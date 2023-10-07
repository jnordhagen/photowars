"use strict"

import express = require('express');

import { Kitten } from '../../definitions/schemas/mongoose/kitten';

const testRouter = express.Router();

/**
 * @openapi
 * /test/kitten:
 *   get:
 *     summary: Returns a single Kitten JSON object from MongoDB.
 *     responses:
 *       200:
 *         description: Successfully retrieved Kitten object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Kitten'
 *       500:
 *         $ref: '#/components/responses/500'
 *
 */
testRouter.get('/kitten', (_req, res) => {
  Kitten.create({
    name: 'Silence'
  }).then((kittyObj) => {
    kittyObj.save().then(() => {
      Kitten.findOne().then((kitten) => {
        res.status(200).json(kitten);
        Kitten.collection.drop();
      }).catch(() => {
        res.status(500).send("Internal Server Error");
      });
    });
  });
});

/**
 * @openapi
 * /test/ping:
 *   get:
 *     summary: Returns a 200 response on successful ping.
 *     responses:
 *       200:
 *         description: Returns 'Pong' text.
 *         content:
 *           text/plain:
 *            schema:
 *              type: string
 *              example: Pong
 */
testRouter.get('/ping', (_req, res) => {
  res.status(200).send("Pong");
});

export { testRouter };
