# Development

This file describes steps for installing and/or using different parts of
the MERN stack to develop our project application locally. The end of the file
describes the different technologies and frameworks we used.

## Mac Installation of Node v18

1. Install Homebrew, a terminal-based package manager. If you haven't yet
    installed Homebrew, you can do so [here](https://brew.sh/).
2. Run `brew update` to update Homebrew.
3. Run `brew install node@18`.
4. Check that you have both `node` and `npm` installed by running

        node -v
        npm -v

## Mac Installation of MongoDB

1. Follow these instructions [here](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/)
2. To check that the installation was successful, run `mongosh`. If it doesn't
   fail then the installation was successful and MongoDB is now running.

## Setting Up Local Development Environment

**All commands should be run in the `src/` directory.**

Install `npm` packages:

        npm install

To start the server on a local port, run

        npm run build
        npm run start

Then, in your browser, go to the localhost URL printed in the terminal.

Alternatively, if you would like to have the browser automatically refresh
when you save changes to React components and `server.js`, instead run

        npm run watch

Then, go to the **Loopback** URL, **not** the URL following `nodemon` output.

## Tips
* Load MongoDB with dummy data using `npm run load`.
* A list of all backend endpoints is located at `/swagger` (e.g. `localhost:3000/swagger`).
* Run the linter often using `npm run lint`.

## Different Technologies Used
Name | Description
--- | ---
Babel | A Javascript and Typescript transpiler that allows compatibility with older environments if language features are not supported natively. Babel also helps transpile JSX/TSX syntax and React components to browser-supported JavaScript.
Express | Express(.js) is a server-side middleware framework that runs inside Node, supporting URL routing and handling HTTP requests and responses.
Node | Node(.js) is a cross-platform server environment that supports   JavaScript outside of the browser.
MongoDB | MongoDB is a NoSQL database program supporting JSON-like documents and schemas.
Mongoose | Mongoose is a Object Data Modeling (ORM) library for MongoDB and Node that manages data and schemas, providing functionality like schema validation to enforce some structure in a MongoDB database.
React | React(.js) is a JavaScript framework for building UI/UX interfaces via individual pieces called components.
Swagger | Swagger is a set of tools used to simplified API documentation using the OpenAPI specification.
Typescript | TypeScript is a superset of JavaScript that adds static typing.
webpack | webpack is a module bundler for JavaScript that turns a JavaScript module into a static, self-contained package with all necessary dependent modules.

