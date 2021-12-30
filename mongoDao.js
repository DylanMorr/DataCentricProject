// require mongodb to conenct to database
const { MongoClient } = require('mongodb');

// Connection URL
const url = 'mongodb://localhost:27017';

// create consts for database and collection names
const dbName = "lecturersDB"
const collName = "lecturers"

// create variables of the database and collection names
var lecturersDB
var lecturers
// create a sort variable to display lectures sorted by id in ascending order
var sort = { _id: 1}

// connect to mongo client url
MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
    // create a promise
    .then((client) => {
        // set lecturersDB variable to the dbName in the mongo db
        lecturersDB = client.db(dbName)
        // set lecturers variable to the collection in the mongo db
        lecturers = lecturersDB.collection(collName)
    })
    .catch((error) => {
        // catch and log any error
        console.log(error)
    })

// create a getLecturers function to get all lecturers in db
var getLecturers = function() {
    // returns a promise
    return new Promise((resolve, reject) => {
        // cursor finds all the lecturers and sorts them in ascending order
        var cursor = lecturers.find().sort(sort)
        // sends lectures to array
        cursor.toArray()
            // creates a promise
            .then((documents) => {
                // resolves documents
                resolve(documents)
            })
            .catch((error) => {
                // catches errors and rejects error
                reject(error)
            })
    })
}

// create an addLecturer function with the parameters for _id, name and dept
var addLecturer = function (_id, name, dept) {
    // return a promise
    return new Promise((resolve, reject) => {
        // insert lecturer _id, name and dept into mongo db here 
        lecturers.insertOne({"_id": _id, "name": name, "dept": dept})
            // creates a promise
            .then((result) => {
                // resolves result
                resolve(result)
            })
            .catch((error) => {
                // catches and rejects error
                reject(error)
            })
    })
}

// create a deleteLecturer function with an _id parameter
var deleteLecturer = function (_id) {
    // returns a promise
    return new Promise((resolve, reject) => {
        // deletes one lecturer from the database using _id 
        lecturers.deleteOne({ "_id" : _id })
            // creates a promise
            .then((result) => {
                // resolves result
                resolve(result)
            })
            .catch((error) => {
                // catches and rejects error
                reject(error)
            })
    })
}

// export all methods
module.exports = { getLecturers, addLecturer, deleteLecturer }