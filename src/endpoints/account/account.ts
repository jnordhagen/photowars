"use strict"

import express = require('express');
import { checkSchema, matchedData, validationResult } from 'express-validator';
import { NewUser } from '../../definitions/schemas/validation/newUser';
import { User } from '../../definitions/schemas/mongoose/user';
import { upload } from '../../server';

const accountRouter = express.Router();

/**
 * @openapi
 * /account/login:
 *   post:
 *     summary: Attempt to log in with given credentials.
 *     requestBody:
 *       description: Username and password for a user.
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               loginName:
 *                 type: string
 *               loginPassword:
 *                 type: string
 *             required:
 *               - loginName
 *               - loginPassword
 *     responses:
 *       200:
 *         description: Successfully logged in.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserFrontend'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 *       500:
 *         $ref: '#/components/responses/500'
 */
accountRouter.post('/login', async (req, res) => {
  const loginName = req.body.loginName;
  const loginPassword = req.body.loginPassword;
  const query = User.findOne(
    {
      loginName: loginName,
      loginPassword: loginPassword
    },
    [
      '-loginName',
      '-loginPassword',
      '-__v'
    ]
  );

  try {
    const result = await query.lean().exec();
    if (result) {
      /* Found user matching login credentials.  */
      req.session.loggedIn = true;
      req.session.userId = result._id.toString();
      res.status(200).json(result);
    } else {
      /* Did not find a user with credentials.  */
      res.status(401).send('Invalid credentials.');
    }
  } catch (err) {
    res.status(500).send('Internal server error.');
    console.error('Failed to query database.');
  }

});

/**
 * @openapi
 * /account/logout:
 *   post:
 *     summary: Log user out.
 *     responses:
 *       200:
 *         description: Successfully logged out.
 *       400:
 *         description: Failed to logout user.
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 *       500:
 *         $ref: '#/components/responses/500'
 */
accountRouter.post('/logout', (req, res) => {
  req.session.loggedIn = false;
  req.session.userId = '';
  res.status(200).send('Successfully logged out.');
});

/**
 * @openapi
 * /account/new:
 *   post:
 *     summary: Creating a new user account.
 *     requestBody:
 *       description: User account information.
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *               loginName:
 *                 type: string
 *               loginPassword:
 *                 type: string
 *             required:
 *               - displayName
 *               - loginName
 *               - loginPassword
 *     responses:
 *       200:
 *         description: Successfully created new user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserFrontend'
 *       400:
 *         description: Faulty information to create new user.
 *       500:
 *         $ref: '#/components/responses/500'
 */
accountRouter.post('/new', upload.none(), checkSchema(NewUser), async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      errors: errors.array()
    });
    return;
  }
  try {
    const body = matchedData(req);
    const userObj = await User.create(body);
    req.session.loggedIn = true;
    req.session.userId = userObj._id.toString();
    res.status(200).json(userObj.toObject());
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error.');
  }
});

export { accountRouter };
