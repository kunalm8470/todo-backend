# Todo backend API

Backend for adding, listing, updating and deleting todos.

A todo item looks like this -
```javascript
{
    "_id": "60b09540c8a51f2904e9d945",
    "title": "Get groceries",
    "description": "Get groceries",
    "completed": false,
    "createdAt": "2021-05-28T07:01:20.904Z",
    "updatedAt": "2021-05-28T07:01:20.904Z",
    "__v": 0
}
```

Features -
- Scalable web server using vanilla javascript, [`Express.js`](https://github.com/expressjs/express) as web framework, and [`Mongoose.js`](https://github.com/Automattic/mongoose) as ODM.
- Use of useful middlewares like [`G-Zip compression`](https://github.com/expressjs/compression), [`CORS`](https://github.com/expressjs/cors), [`Helmet.js`](https://github.com/helmetjs/helmet), and [`Correlation Id`](https://github.com/puzpuzpuz/cls-rtracer).
- Centralized Request body validation for HTTP POST and HTTP PUT requests using [`JSON schema AJV`](https://github.com/ajv-validator/ajv).
- Structured logging using [`Winston.js`](https://github.com/winstonjs/winston) and file transport and log rotation using [`winston-daily-rotate-file`](https://github.com/winstonjs/winston-daily-rotate-file).
- Fully dockerized.
- Unit testing using [`Mocha.js`](https://github.com/mochajs/mocha) as test runner, [`Chai.js`](https://github.com/chaijs/chai) for assertions, [`Sinon.js`](https://github.com/sinonjs/sinon) for stubbing/spying, and [`Faker.js`](https://github.com/Marak/Faker.js) for generating fake data.
- e2e testing using [`Mocha.js`](https://github.com/mochajs/mocha) as test runner, [`supertest`](https://github.com/visionmedia/supertest) to send HTTP requests, and [`MongoDB In-Memory Server`](https://github.com/nodkz/mongodb-memory-server) for persistence during test runs.
- HTML test coverage using [`nyc`](https://github.com/istanbuljs/nyc).

NPM scripts -
- `npm install` - to install dependencies.
- `npm run start` - to start web server
- `npm run dev` - to start web server in dev mode using nodemon
- `npm run test` - to run unit and e2e tests
- `npm run coverage` - to generate test coverage

Docker -
`docker compose up` to start the web server with its dependencies.

Postman [`collection`](./Todo%20backend.postman_collection.json), [`collection public link`](https://www.getpostman.com/collections/4731c3cbf7cb74c8f010), and [`environment variables`](./Local.postman_environment.json) here.
