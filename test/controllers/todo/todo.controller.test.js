const { expect } = require('chai');
const faker = require('faker');
const mongoose = require('mongoose');
const request = require('supertest');
const { StatusCodes } = require('http-status-codes');

const { app } = require('../../../index');
const Todo = require('../../../src/models/todo.model');
const { connect, disconnect, setupTestData, teardownTestData } = require('../setup');
const fixture = require('./fixture');

before(async () => {
  await connect();
  await Todo.ensureIndexes();
});

after(async () => {
  await disconnect();
});

describe('TodoController', () => {
  const url = '/api/v1/todo';

  beforeEach('Setup DB', async () => {
    await setupTestData(Todo, fixture);
  });

  afterEach('Teardown DB', async () => {
    await teardownTestData(Todo);
  });

  describe('GET /api/v1/todo', () => {
    let page;
    let limit;

    it('Should paginate with implicit page and limit', (done) => {
      request(app)
        .get(url)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(StatusCodes.OK)
        .then((response) => {
          expect(response.body).to.be.an('object').to.have.all.keys('page', 'first_page', 'last_page', 'prev_page', 'next_page', 'page_size', 'total_count', 'data');

          // Implicit values for page and limit
          expect(response.body.page).to.equal(1);
          expect(response.body.page_size).to.equal(10);

          expect(response.body.data).to.be.an('array');
          expect(response.body.data[0]).to.be.an('object').to.have.all.keys('_id', 'title', 'description', 'completed', 'createdAt', 'updatedAt', '__v');
          done();
        })
        .catch((err) => done(err));
    });

    it('Should paginate with explicit page and limit', (done) => {
      page = 2;
      limit = 1;

      request(app)
        .get(`${url}?page=${page}&limit=${limit}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(StatusCodes.OK)
        .then((response) => {
          expect(response.body).to.be.an('object').to.have.all.keys('page', 'first_page', 'last_page', 'prev_page', 'next_page', 'page_size', 'total_count', 'data');
          expect(response.body.page).to.equal(2);
          expect(response.body.page_size).to.equal(1);
          expect(response.body.data).to.be.an('array');
          expect(response.body.data[0]).to.be.an('object').to.have.all.keys('_id', 'title', 'description', 'completed', 'createdAt', 'updatedAt', '__v');
          done();
        })
        .catch((err) => done(err));
    });

    it('Trying to paginate with negative page', (done) => {
      page = -1;
      limit = 10;

      request(app)
        .get(`${url}?page=${page}&limit=${limit}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(StatusCodes.BAD_REQUEST)
        .then((response) => {
          expect(response.body).to.be.an('object').to.have.all.keys('type', 'error');
          expect(response.body.type).to.be.equal('Invalid pagination parameter error');
          done();
        })
        .catch((err) => done(err));
    });

    it('Trying to paginate with negative limit', (done) => {
      page = 1;
      limit = -1;

      request(app)
        .get(`${url}?page=${page}&limit=${limit}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(StatusCodes.BAD_REQUEST)
        .then((response) => {
          expect(response.body).to.be.an('object').to.have.all.keys('type', 'error');
          expect(response.body.type).to.be.equal('Invalid pagination parameter error');
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('GET /api/v1/todo/:id', () => {
    it('Should return todo with valid id', (done) => {
      Todo.find({}).limit(1).exec().then((todo) => {
        const id = todo[0]._id;

        request(app)
          .get(`${url}/${id.toString()}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(StatusCodes.OK)
          .then((response) => {
            expect(response.body).to.be.an('object').to.have.all.keys('_id', 'title', 'description', 'completed', 'createdAt', 'updatedAt', '__v');
            expect(response.body._id.toString()).to.be.equal(id.toString());
            done();
          })
          .catch((err) => done(err));
      });
    });

    it('Should return not found with valid objectid which doesn\'t exist', (done) => {
      const id = mongoose.Types.ObjectId();

      request(app)
        .get(`${url}/${id.toString()}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(StatusCodes.NOT_FOUND)
        .then((response) => {
          expect(response.body).to.be.an('object').to.have.all.keys('type', 'error');
          expect(response.body.type).to.be.equal('Item not found error');
          expect(response.body.error).to.be.equal(`Todo item not found with id - ${id.toString()}`);
          done();
        })
        .catch((err) => done(err));

    });

    it('Should return bad request for with malformed objectid', (done) => {
      const id = `Invalid%20id`;

      request(app)
        .get(`${url}/${id.toString()}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(StatusCodes.BAD_REQUEST)
        .then((response) => {
          expect(response.body).to.be.an('object').to.have.all.keys('type', 'error');
          expect(response.body.type).to.be.equal('Invalid id error');
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('POST /api/v1/todo', () => {
    let dto;

    beforeEach(() => {
      dto = {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        completed: false
      };
    });

    it('Should create a todo', (done) => {
      request(app)
        .post(url)
        .send(dto)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(StatusCodes.CREATED)
        .then((response) => {
          expect(response.body.error).to.be.undefined;
          expect(response.header.location).to.not.be.undefined;
          expect(response.body).to.be.an('object').to.have.all.keys('_id', 'title', 'description', 'completed', 'createdAt', 'updatedAt', '__v');
          done();
        })
        .catch((err) => done(err));
    });

    it('Should not create a todo with existing title and completed', (done) => {
      request(app)
        .post(url)
        .send(dto)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(StatusCodes.CREATED)
        .then((topResponse) => {
          expect(topResponse.body.error).to.be.undefined;
          expect(topResponse.header.location).to.not.be.undefined;
          expect(topResponse.body).to.be.an('object').to.have.all.keys('_id', 'title', 'description', 'completed', 'createdAt', 'updatedAt', '__v');

          request(app)
            .post(url)
            .send(dto)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(StatusCodes.CONFLICT)
            .then((response) => {
              expect(response.body).to.be.an('object').to.have.all.keys('type', 'error');
              expect(response.body.type).to.be.equals('Duplicate error');
              return done();
            })
            .catch((err) => done(err));
        })
        .catch((topErr) => done(topErr));
    });

    it('Should not create a todo passing an empty object', (done) => {
      request(app)
        .post(url)
        .send(Object.create(null))
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(StatusCodes.BAD_REQUEST)
        .then((response) => {
          expect(response.body).to.be.an('object').to.have.all.keys('type', 'error', 'details');
          expect(response.body.type).to.be.equal('Schema validation error');
          expect(response.body.details).to.be.an('array').to.have.lengthOf(3);
          done();
        })
        .catch((err) => done(err));
    });

    it('Should not create a todo passing an object without title', (done) => {
      const copiedTodo = { ...dto };
      delete copiedTodo.title;

      request(app)
        .post(url)
        .send(copiedTodo)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(StatusCodes.BAD_REQUEST)
        .then((response) => {
          expect(response.body).to.be.an('object').to.have.all.keys('type', 'error', 'details');
          expect(response.body.type).to.be.equal('Schema validation error');
          expect(response.body.details).to.be.an('array').to.have.lengthOf(1);
          done();
        })
        .catch((err) => done(err));
    });

    it('Should not create a todo passing an object without description', (done) => {
      const copiedTodo = { ...dto };
      delete copiedTodo.description;

      request(app)
        .post(url)
        .send(copiedTodo)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(StatusCodes.BAD_REQUEST)
        .then((response) => {
          expect(response.body).to.be.an('object').to.have.all.keys('type', 'error', 'details');
          expect(response.body.type).to.be.equal('Schema validation error');
          expect(response.body.details).to.be.an('array').to.have.lengthOf(1);
          done();
        })
        .catch((err) => done(err));
    });

    it('Should not create a todo passing an object without completed', (done) => {
      const copiedTodo = { ...dto };
      delete copiedTodo.completed;

      request(app)
        .post(url)
        .send(copiedTodo)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(StatusCodes.BAD_REQUEST)
        .then((response) => {
          expect(response.body).to.be.an('object').to.have.all.keys('type', 'error', 'details');
          expect(response.body.type).to.be.equal('Schema validation error');
          expect(response.body.details).to.be.an('array').to.have.lengthOf(1);
          done();
        })
        .catch((err) => done(err));
    });

    it('Should not create a todo passing an object without title and description', (done) => {
      const copiedTodo = { ...dto };
      delete copiedTodo.title;
      delete copiedTodo.description;

      request(app)
        .post(url)
        .send(copiedTodo)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(StatusCodes.BAD_REQUEST)
        .then((response) => {
          expect(response.body).to.be.an('object').to.have.all.keys('type', 'error', 'details');
          expect(response.body.type).to.be.equal('Schema validation error');
          expect(response.body.details).to.be.an('array').to.have.lengthOf(2);
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('PUT /api/v1/todo', () => {
    it('Should update the todo when valid payload is passed', (done) => {
      Todo.find({}).limit(1).exec().then((todo) => {
        const dto = {
          id: todo[0]._id.toString(),
          title: faker.lorem.sentence(),
          description: faker.lorem.paragraph(),
          completed: true
        };

        request(app)
          .put(url)
          .send(dto)
          .set('Accept', 'application/json')
          .expect(StatusCodes.OK)
          .then((_) => {
            done();
          })
          .catch((err) => done(err));
      });
    });

    it('Should not update anything when payload with non existent id is passed', (done) => {
      const dto = {
        id: mongoose.Types.ObjectId().toString(),
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        completed: true
      };

      request(app)
        .put(url)
        .send(dto)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(StatusCodes.NOT_FOUND)
        .then((response) => {
          expect(response.body).to.be.an('object').to.have.all.keys('type', 'error');
          expect(response.body.type).to.be.equal('Item not found error');
          done();
        })
        .catch((err) => done(err));
    });

    it('Should not update anything when payload with malformed id is passed', (done) => {
      const dto = {
        id: faker.random.alphaNumeric(24),
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        completed: true
      };

      request(app)
        .put(url)
        .send(dto)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(StatusCodes.BAD_REQUEST)
        .then((response) => {
          expect(response.body).to.be.an('object').to.have.all.keys('type', 'error');
          expect(response.body.type).to.be.equal('Invalid id error');
          done();
        })
        .catch((err) => done(err));
    });

    it('Should not update anything when no payload is passed', (done) => {
      request(app)
        .put(url)
        .send(Object.create(null))
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(StatusCodes.BAD_REQUEST)
        .then((response) => {
          expect(response.body).to.be.an('object').to.have.all.keys('type', 'error', 'details');
          expect(response.body.type).to.be.equal('Schema validation error');
          expect(response.body.details).to.be.an('array').to.have.lengthOf(4);
          done();
        })
        .catch((err) => done(err));
    });

    it('Should not update anything when title and description is missing from the payload', (done) => {
      Todo.find({}).limit(1).exec().then((todo) => {
        const dto = {
          id: todo[0]._id.toString(),
          completed: true
        };

        request(app)
          .put(url)
          .send(dto)
          .set('Accept', 'application/json')
          .expect(StatusCodes.BAD_REQUEST)
          .then((response) => {
            expect(response.body).to.be.an('object').to.have.all.keys('type', 'error', 'details');
            expect(response.body.type).to.be.equal('Schema validation error');
            expect(response.body.details).to.be.an('array').to.have.lengthOf(2);
            done();
          })
          .catch((err) => done(err));
      });
    });
  });

  describe('DELETE /api/v1/todo/:id', () => {
    it('Should delete the todo when valid id is passed', (done) => {
      Todo.find({}).limit(1).exec().then((todo) => {
        const id = todo[0]._id.toString();

        request(app)
          .delete(`${url}/${id}`)
          .set('Accept', 'application/json')
          .expect(StatusCodes.NO_CONTENT)
          .then((_) => {
            done();
          })
          .catch((err) => done(err));
      });
    });

    it('Should not delete anything when payload if non existent id is passed', (done) => {
      const id = mongoose.Types.ObjectId().toString();

      request(app)
        .delete(`${url}/${id}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(StatusCodes.NOT_FOUND)
        .then((response) => {
          expect(response.body).to.be.an('object').to.have.all.keys('type', 'error');
          expect(response.body.type).to.be.equal('Item not found error');
          done();
        })
        .catch((err) => done(err));
    });

    it('Should not delete anything when payload if malformed id is passed', (done) => {
      const id = `Invalid%20id`;

      request(app)
        .delete(`${url}/${id}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(StatusCodes.BAD_REQUEST)
        .then((response) => {
          expect(response.body).to.be.an('object').to.have.all.keys('type', 'error');
          expect(response.body.type).to.be.equal('Invalid id error');
          done();
        })
        .catch((err) => done(err));
    });
  });
});
