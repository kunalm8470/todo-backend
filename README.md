# Node.js CRUD application

Sample barebone application using Express.js and Mongoose.js using MongoDb as persistence.

This application deals with a single entity todo item. 

Operations permitted are adding, reading, paging, updating, and deleting todo items.

Sample structure looks like -
```javascript
{
    "completed": false,
    "_id": "60b09540c8a51f2904e9d945",
    "title": "Get groceries",
    "createdAt": "2021-05-28T07:01:20.904Z",
    "updatedAt": "2021-05-28T07:01:20.904Z",
    "__v": 0
}
```

To run - `npm install`

To start the server - `npm start`


Postman [`collection`](https://www.getpostman.com/collections/4731c3cbf7cb74c8f010) and [`environment variables`](./Local.postman_environment.json) here.