// require promise-mysql
var mysql = require('promise-mysql')

// create a pool variable
var pool

// create pool
mysql.createPool({
    // set pool parameters
    connectionLimit: 3,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'collegedb'
})
    // create a promise
    .then((result) => {
        // set pool = result
        pool = result
    })
    .catch((err) => {
        // catch and log any error
        console.log(err)
    });

// create a getModules function to get all modules
var getModules = function () {
    // returns a promise
    return new Promise((resolve, reject) => {
        // send the query to mysql
        pool.query('select * from module')
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

// create a getOneModule function to get one module and pass mid parameter
var getOneModule = function (mid) {
    // returns a promise
    return new Promise((resolve, reject) => {
        // set up query for mysql
        var myQuery = {
            sql: 'select * from module where mid = ?',
            values: [mid]
        }
        // send the query to mysql
        pool.query(myQuery)
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

// create an editModule function to edit the module details and pass the name, credits and mid parameters
var editModule = function (name, credits, mid) {
    // returns a promise
    return new Promise((resolve, reject) => {
        // set up query for mysql
        var myQuery = {
            sql: 'update module set name = ?, credits = ? where mid = ?',
            values: [name, credits, mid]
        }
        // send the query to mysql
        pool.query(myQuery)
            .then((result) => {
                // resolves result
                resolve(result)
            })
            .catch(() => {
                // catches and rejects error 
                reject(error)
            })
    })
}

// create a getStudent function to get one student from db and pass mid parameter
var getStudent = function (mid) {
    // returns a promise
    return new Promise((resolve, reject) => {
        // set up query for mysql
        var myQuery = {
            sql: 'select s.* from student s inner join student_module sm on s.sid = sm.sid where sm.mid = ?',
            values: [mid]
        }
        // send the query to mysql
        pool.query(myQuery)
            .then((result) => {
                // resolves result
                resolve(result)
            })
            .catch(() => {
                // catches and rejects error 
                reject(error)
            })
    })
}

// create a getAllStudents function to get all students from db
var getAllStudents = function() {
    // returns a promise
    return new Promise((resolve, reject) => {
        // send the query to mysql
        pool.query('select * from student')
            .then((result) => {
                // resolves result
                resolve(result)
            })
            .catch(() => {
                // catches and rejects error 
                reject(error)
            })
    })
}

// create a deleteStudent function to delete student from db and pass sid parameter
var deleteStudent = function(sid) {
    // returns a promise
    return new Promise((resolve, reject) => {
        // set up query for mysql
        var myQuery = {
            sql: 'delete from student where sid = ?',
            values: [sid]
        }
        // send the query to mysql
        pool.query(myQuery)
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

// create an addStudent function to add a student to the db and pass student parameter
var addStudent = function(student) {
    // returns a promise
    return new Promise((resolve, reject) => {
        // set up query for mysql
        var myQuery = {
            sql: 'INSERT INTO student (sid, name, gpa) VALUES (?)',
            values: [student]
        }
        // send the query to mysql
        pool.query(myQuery)
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

// export all methods here
module.exports = { getModules, getOneModule, editModule, getStudent, getAllStudents, deleteStudent, addStudent, }