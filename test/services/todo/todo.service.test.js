const { assert, expect } = require('chai');
const faker = require('faker');
const mongoose = require('mongoose');
const sinon = require('sinon');

const { TodoService } = require('../../../src/services');
const { TodoRepository } = require('../../../src/repositories');
const { InvalidObjectIdError, ItemNotFoundError, DuplicateItemError } = require('../../../src/utils/errors');

afterEach(() => {
    // Restore the default sandbox here
    sinon.restore();
});

describe('TodoService', () => {
    describe('#getAll', () => {
        it('should be called once', async () => {
            // Arrange
            const searchOptions = {
                page: '1',
                limit: '10'
            };
            const page = 1;
            const offset = 0;
            const limit = 10;
            const stubResponse = {
                pages: 1,
                first_page: "/api/v1/todo?page=1&limit=10",
                last_page: "/api/v1/todo?page=1&limit=10",
                prev_page: "/api/v1/todo?page=1&limit=10",
                next_page: "/api/v1/todo?page=1&limit=10",
                page_size: 10,
                total_count: 1,
                data: [
                    {
                        _id: mongoose.Types.ObjectId(),
                        title: faker.lorem.sentence(),
                        description: faker.lorem.paragraph(),
                        completed: false,
                        createdAt: faker.date.past(),
                        updatedAt: faker.date.past()
                    }
                ]
            };
            sinon.stub(TodoRepository, 'getAll').withArgs(page, offset, limit).returns(stubResponse);
            const spy = sinon.spy(TodoService, 'getAll');

            // Act
            await TodoService.getAll(searchOptions);

            // Assert
            expect(spy.calledOnce).to.be.true;
            expect(spy.calledWith(searchOptions)).to.be.true;
        });
    });

    describe('#getById', () => {
        it('should return todo item when valid id is passed', async () => {
            // Arrange
            const todoResponse = {
                _id: mongoose.Types.ObjectId(),
                title: faker.lorem.sentence(),
                description: faker.lorem.paragraph(),
                completed: false,
                createdAt: faker.date.past(),
                updatedAt: faker.date.past(),
            };
            const id = mongoose.Types.ObjectId().toString();
            sinon.stub(TodoRepository, 'getById').withArgs(id).returns(todoResponse);
            const spy = sinon.spy(TodoService, 'getById');

            // Act
            await TodoService.getById(id);

            // Assert
            expect(spy.calledOnce).to.be.true;
        });

        it('should throw ItemNotFoundError when non existent id is passed', async () => {
            // Arrange
            const notFoundId = mongoose.Types.ObjectId().toString();
            const stub = sinon.stub(TodoService, 'getById').withArgs(notFoundId).throws(new ItemNotFoundError(`Todo item not found with id - ${notFoundId}`));

            try {
                // Act
                await TodoService.getById(notFoundId);
            } catch (err) {
                // Assert
                assert.instanceOf(err, ItemNotFoundError);
                assert.strictEqual(err.message, `Todo item not found with id - ${notFoundId}`);
            }

            expect(stub.calledOnce).to.be.true;
        });

        it('should throw InvalidObjectIdError when malformed id is passed', async () => {
            // Arrange
            const malformedId = 'Invalid id';
            const stub = sinon.stub(TodoService, 'getById').withArgs(malformedId).throws(new InvalidObjectIdError());

            try {
                // Act
                await TodoService.getById(malformedId);
            } catch (err) {
                // Assert
                assert.instanceOf(err, InvalidObjectIdError);
            }

            expect(stub.calledOnce).to.be.true;
        });
    });

    describe('#add', () => {
        it('should add a new todo', async () => {
            // Arrange
            const stubValue = {
                _id: mongoose.Types.ObjectId(),
                title: faker.lorem.sentence(),
                description: faker.lorem.paragraph(),
                completed: false,
                createdAt: faker.date.past(),
                updatedAt: faker.date.past()
            };

            const dto = {
                title: stubValue.title,
                description: stubValue.description,
                completed: false
            };

            sinon.stub(TodoRepository, 'add').withArgs(dto).returns(stubValue);
            const spy = sinon.spy(TodoService, 'add');

            // Act
            await TodoService.add(dto);

            // Assert
            expect(spy.calledOnce).to.be.true;
        });

        it('should throw DuplicateItemError on adding duplicate todo', async () => {
            // Arrange
            const error = new Error();
            error.name = 'MongoError';
            error.code = 11000;

            const stubValue = {
                _id: mongoose.Types.ObjectId(),
                title: faker.lorem.sentence(),
                description: faker.lorem.paragraph(),
                completed: false,
                createdAt: faker.date.past(),
                updatedAt: faker.date.past()
            };

            const dto = {
                title: stubValue.title,
                description: stubValue.description,
                completed: false
            };

            sinon.stub(TodoRepository, 'add').withArgs(dto).onFirstCall().returns(stubValue)
                .withArgs(dto).onSecondCall().throws(error);

            const spy = sinon.spy(TodoService, 'add');

            // Act
            await TodoService.add(dto);

            try {
                await TodoService.add(dto);
            } catch (e) {
                // Assert
                expect(spy.calledTwice).to.be.true;
                assert.instanceOf(e, DuplicateItemError);
            }
        });
    });

    describe('#update', () => {
        it('should return update item when valid item is passed', async () => {
            // Arrange
            const dto = {
                id: mongoose.Types.ObjectId().toString(),
                title: faker.lorem.sentence(),
                description: faker.lorem.paragraph(),
                completed: true
            };
            const updateResult = {
                acknowledged: true,
                modifiedCount: 1,
                upsertedId: null,
                upsertedCount: 0,
                matchedCount: 1
            };

            sinon.stub(TodoRepository, 'update').withArgs(dto).returns(updateResult);
            const spy = sinon.spy(TodoService, 'update');

            // Act
            await TodoService.update(dto);

            // Assert
            expect(spy.calledOnce).to.be.true;
        });

        it('should throw InvalidObjectIdError when malformed id is passed in the payload', async () => {
            // Arrange
            const dto = {
                id: 'Invalid id',
                title: faker.lorem.sentence(),
                description: faker.lorem.paragraph(),
                completed: true
            };
            const stub = sinon.stub(TodoService, 'update').withArgs(dto).throws(new InvalidObjectIdError());

            try {
                // Act
                await TodoService.update(dto);
            } catch (err) {
                // Assert
                expect(stub.calledOnce).to.be.true;
                assert.instanceOf(err, InvalidObjectIdError);
            }
        });

        it('should throw ItemNotFoundError when non existent id is passed in the payload', async () => {
            // Arrange
            const notFoundId = mongoose.Types.ObjectId();
            const dto = {
                id: notFoundId.toString(),
                title: faker.lorem.sentence(),
                description: faker.lorem.paragraph(),
                completed: true
            };
            const stub = sinon.stub(TodoService, 'update').withArgs(dto).throws(new ItemNotFoundError(`Todo item not found with id - ${dto.id}`));

            try {
                // Act
                await TodoService.update(dto);
            } catch (err) {
                // Assert
                expect(stub.calledOnce).to.be.true;
                assert.instanceOf(err, ItemNotFoundError);
                assert.strictEqual(err.message, `Todo item not found with id - ${notFoundId}`);
            }
        });
    });

    describe('#delete', () => {
        it('should delete correctly when valid id is passed', async () => {
            // Arrange
            const id = mongoose.Types.ObjectId().toString();
            const deleteResult = {
                acknowledged: true,
                deletedCount: 1
            };

            sinon.stub(TodoRepository, 'delete').withArgs(id).returns(deleteResult);
            const spy = sinon.spy(TodoService, 'delete');

            // Act
            await TodoService.delete(id);

            // Assert
            expect(spy.calledOnce).to.be.true;
        });

        it('should throw InvalidObjectIdError when malformed id is passed', async () => {
            // Arrange
            const id = 'Invalid id';
            const stub = sinon.stub(TodoService, 'delete').withArgs(id).throws(new InvalidObjectIdError());

            try {
                // Act
                await TodoService.delete(id);
            } catch (err) {
                // Assert
                expect(stub.calledOnce).to.be.true;
                assert.instanceOf(err, InvalidObjectIdError);
            }
        });

        it('should throw ItemNotFoundError when non existent id is passed', async () => {
            // Arrange
            const notFoundId = mongoose.Types.ObjectId();
            const stub = sinon.stub(TodoService, 'delete').withArgs(notFoundId).throws(new ItemNotFoundError(`Todo item not found with id - ${notFoundId.toString()}`));

            try {
                // Act
                await TodoService.delete(notFoundId);
            } catch (err) {
                // Assert
                expect(stub.calledOnce).to.be.true;
                assert.instanceOf(err, ItemNotFoundError);
                assert.strictEqual(err.message, `Todo item not found with id - ${notFoundId.toString()}`);
            }
        });
    });
});
