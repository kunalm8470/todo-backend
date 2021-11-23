const { assert, expect } = require('chai');
const faker = require('faker');
const sinon = require('sinon');
const mongoose = require('mongoose');

const Todo = require('../../../src/models/todo.model');
const { TodoRepository } = require('../../../src/repositories');

afterEach(() => {
    // Restore the default sandbox here
    sinon.restore();
});

describe('TodoRepository', () => {
    describe('#getAll', () => {
        let offset;
        let page;
        let limit;

        const stubArray = Array.from({ length: 10 }, () => (
            {
                _id: mongoose.Types.ObjectId(),
                title: faker.lorem.sentence(),
                description: faker.lorem.paragraph(),
                completed: false,
                createdAt: faker.date.past(),
                updatedAt: faker.date.past()
            }
        ));

        before(() => {
            offset = 0;
            page = 1;
            limit = 10;
        });

        it('should return length 3 when 3 items are added', async (done) => {
            // Arrange
            sinon.stub(Todo, 'find').returns({
                skip: (n) => {
                    return {
                        limit: (m) => {
                            return new Promise((resolve, reject) => {
                                resolve(stubArray);
                                done();
                            });
                        }
                    }
                }
            });

            sinon.stub(Todo, 'estimatedDocumentCount').returns({
                exec: () => stubArray.length
            });

            // Act
            const todos = await TodoRepository.getAll(page, offset, limit);

            // Assert
            assert.strictEqual(todos.data.length, stubArray.length);
            assert.strictEqual(todos.total_count, stubArray.length);
        });

        before(() => {
            offset = 0;
            page = 1;
            limit = 10;
        });

        it('should return length 0 when no items are added', async (done) => {
            // Arrange

            sinon.stub(Todo, 'find').returns({
                skip: (n) => {
                    return {
                        limit: (m) => {
                            return new Promise((resolve, reject) => {
                                resolve([]);
                                done();
                            });
                        }
                    }
                }
            });

            sinon.stub(Todo, 'estimatedDocumentCount').returns({
                exec: () => 0
            });

            // Act
            const todos = await TodoRepository.getAll(page, offset, limit);

            // Assert
            assert.strictEqual(todos.data.length, 0);
            assert.strictEqual(todos.total_count, 0);
        });

        before(() => {
            offset = 1;
            page = 2;
            limit = 1;
        });

        it('should skip 1 and return 1 when offset is 1 and limit is 1', async (done) => {
            // Arrange
            sinon.stub(Todo, 'find').returns({
                skip: (n) => {
                    return {
                        limit: (m) => {
                            return new Promise((resolve, reject) => {
                                resolve(stubArray.slice(n, n + m));
                                done();
                            });
                        }
                    }
                }
            });
            sinon.stub(Todo, 'estimatedDocumentCount').returns({
                exec: () => stubArray.length
            });

            // Act
            const todos = await TodoRepository.getAll(page, offset, limit);

            // Assert
            assert.strictEqual(todos.data.length, 1);
            assert.strictEqual(todos.data[0].title, stubArray[1].title);
            assert.strictEqual(todos.total_count, stubArray.length);
        });
    });

    describe('#getById', () => {


        it('should return todo item when valid id is passed', async () => {
            // Arrange
            const _id = mongoose.Types.ObjectId();
            const stubValue = {
                _id,
                title: faker.lorem.sentence(),
                description: faker.lorem.paragraph(),
                completed: false,
                createdAt: faker.date.past(),
                updatedAt: faker.date.past()
            };
            const stub = sinon.stub(Todo, 'findById').returns(stubValue);

            // Act
            const todo = await TodoRepository.getById(_id.toString());

            // Assert
            expect(stub.calledOnce).to.be.true;
            assert.strictEqual(todo._id.toString(), stubValue._id.toString());
            assert.strictEqual(todo.title, stubValue.title);
            assert.strictEqual(todo.description, stubValue.description);
            assert.strictEqual(todo.completed, stubValue.completed);
            assert.strictEqual(todo.createdAt, stubValue.createdAt);
            assert.strictEqual(todo.updatedAt, stubValue.updatedAt);
        });

        it('should return null when invalid id is passed', async () => {
            // Arrange
            const invalidId = mongoose.Types.ObjectId();
            const invalidIdResult = null;
            const stub = sinon.stub(Todo, 'findById').withArgs(invalidId).returns(invalidIdResult);

            // Act
            const todo = await TodoRepository.getById(invalidId);

            // Assert
            expect(stub.calledOnce).to.be.true;
            assert.strictEqual(todo, invalidIdResult);
        });
    });

    describe('#add', () => {
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

        it('should add a new todo', async () => {
            // Arrange
            const stub = sinon.stub(Todo, 'create').returns(stubValue);

            // Act
            const todo = await TodoRepository.add(dto);

            // Assert
            expect(stub.calledOnce).to.be.true;
            assert.strictEqual(todo._id, stubValue._id);
            assert.strictEqual(todo.title, stubValue.title);
            assert.strictEqual(todo.description, stubValue.description);
            assert.strictEqual(todo.completed, stubValue.completed);
            assert.strictEqual(todo.createdAt, stubValue.createdAt);
            assert.strictEqual(todo.updatedAt, stubValue.updatedAt);
        });

        it('should throw unique index exception with code 11000 on adding duplicate todo', async () => {
            // Arrange
            const error = new Error();
            error.name = 'MongoError';
            error.code = 11000;

            sinon.stub(Todo, 'create').withArgs(dto).onFirstCall().returns(stubValue)
                .withArgs(dto).onSecondCall().throws(error);

            // Act
            await TodoRepository.add(dto);

            try {
                await TodoRepository.add(dto);
            } catch (e) {
                // Assert
                assert.strictEqual(e.name, error.name);
                assert.strictEqual(e.code, error.code);
            }
        });
    });

    describe('#update', () => {
        const id = mongoose.Types.ObjectId();

        const updateDto = {
            id: id.toString(),
            title: faker.lorem.sentence(),
            description: faker.lorem.paragraph(),
            completed: true
        };
        const filter = {
            _id: id
        };
        const payload = {
            title: updateDto.title,
            description: updateDto.description,
            completed: updateDto.completed
        };
        const updateResult = {
            acknowledged: true,
            modifiedCount: 1,
            upsertedId: null,
            upsertedCount: 0,
            matchedCount: 1
        };

        it('should update correctly when valid id is passed', async () => {
            // Arrange
            const stub = sinon.stub(Todo, 'updateOne').withArgs(filter, payload).returns(updateResult);

            // Act
            const result = await TodoRepository.update(updateDto);

            // Assert
            expect(stub.calledOnce).to.be.true;
            assert.strictEqual(result.matchedCount, updateResult.matchedCount);
            assert.strictEqual(result.modifiedCount, updateResult.modifiedCount);
        });

        it('should not update anything when non existent id is passed', async () => {
            // Arrange
            const invalidId = mongoose.Types.ObjectId();
            
            updateDto.id = invalidId.toString();
            filter._id = invalidId;

            updateResult.matchedCount = 0;
            updateResult.modifiedCount = 0;

            const stub = sinon.stub(Todo, 'updateOne').withArgs(filter, payload).returns(updateResult);

            // Act
            const result = await TodoRepository.update(updateDto);

            // Assert
            expect(stub.calledOnce).to.be.true;
            assert.strictEqual(result.matchedCount, updateResult.matchedCount);
            assert.strictEqual(result.modifiedCount, updateResult.modifiedCount);
        });
    });

    describe('#delete', () => {
        const id = mongoose.Types.ObjectId();
        const filter = {
            _id: id
        };
        const deleteResult = {
            acknowledged: true,
            deletedCount: 1
        };

        it('should delete correctly when valid id is passed', async () => {
            // Arrange
            const stub = sinon.stub(Todo, 'deleteOne').withArgs(filter).returns(deleteResult);

            // Act
            const result = await TodoRepository.delete(id.toString());

            // Assert
            expect(stub.calledOnce).to.be.true;
            assert.strictEqual(result.deletedCount, deleteResult.deletedCount);
        });


        it('should not delete anything when non existent id is passed', async () => {
            // Arrange
            deleteResult.deletedCount = 0;

            const stub = sinon.stub(Todo, 'deleteOne').withArgs(filter).returns(deleteResult);

            // Act
            const result = await TodoRepository.delete(id.toString());

            // Assert
            expect(stub.calledOnce).to.be.true;
            assert.strictEqual(result.deletedCount, deleteResult.deletedCount);
        });
    });
});
