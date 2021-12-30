const express = require('express')
const res = require('express/lib/response')
const app = express()
// port 3000
const port = 3000
// require mySqlDao to control mysql 
var mySqlDao = require('./mySqlDao')
// require mongoDao to control mongo
var mongoDao = require('./mongoDao')
var bodyParser = require('body-parser')
const { body, validationResult, check } = require('express-validator');
// create a credits const for validation checking
const credits = [5, 10, 15]

// set view engine to ejs
app.set('view engine', 'ejs')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// get request to / to display home page
app.get('/', (req, res) => {
    // render the homePage file
    res.render('homePage')
})

// get request to /listModules to display all modules
app.get('/listModules', (req, res) => {
    // call getModules method in mySqlDao 
    mySqlDao.getModules()
    // create a promise
        .then((result) => {
            // render list modules file pass result down
            res.render('listModules', {modules:result})
        })
        .catch((error) => {
            // catch and send error
            res.send(error)
        })
})

// get request to /module/edit/:mid to get modules info to display it in form
app.get('/module/edit/:mid', (req, res) => {
    // call getOneModule in mySqlDao
    mySqlDao.getOneModule(req.params.mid)
        // create a promise
        .then((result) => {
            // log result to console
            console.log(result)
            // render editModule file and pass errors and result
            res.render('editModule', {errors:undefined, module:result})
        })
        .catch((error) => {
            // log any errors to console
            console.log(error)
        })
})

// post request to /module/edit/:mid
app.post('/module/edit/:mid', 
[
// validation checks and error messages
check('name').isLength({min:5}).withMessage("The module name should be a minimum of 5 characters"),
check('credits').isIn(credits).withMessage("The credits should be 5, 10 or 15")
],
(req, res) => {
    // set errors = validationResult
    var errors = validationResult(req)
    // pass this variable in editModule so the disabled in the form works correctly
    var moduleId = req.params.mid

    // if there are errors don't continue
    if (!errors.isEmpty()) {
        // get the module details
        mySqlDao.getOneModule(req.params.mid)
            // create a promise
            .then((result) => {
                // log the result
                console.log(result)
                // render editModule file again and pass errors and result to display errors on pagea
                res.render('editModule', {errors:errors.errors, module:result})
            })
    }
    else {
        // if there are no errors continue with editing module passing the name, credits and moduleId to the method in mySqlDao
        mySqlDao.editModule(req.body.name, req.body.credits, moduleId)
            // create a promis
            .then((result) => {
                // log results
                console.log(result)
                // redirect to listModules page
                res.redirect('/listModules')
            })
            .catch((error) => {
                // catch and log any error
                console.log(error)
            })
    }
})

// get request to /module/students/:mid to display students studying a specfice module
app.get('/module/students/:mid', (req, res) => {
    // call getStudent in mySqlDao and pass down mid
    mySqlDao.getStudent(req.params.mid)
        // create a promise
        .then((result) => {
            // if the result.length from getStudent is greater than 0 continue 
            if (result.length > 0) {
                // render listOneStudent and pass result and mid
                res.render('listOneStudent', {students:result, mid:req.params.mid})
            }
            else {
                // catch moduleId error and redner midError page and pass mid down
                res.render("midError", {mid:req.params.mid})
            }
        })
        .catch((error) => {
            // catch and display any other errors
            res.send(error)
        })
})

// get request to listStudents to display all students
app.get('/listStudents', (req, res) => {
    // call getAllStudents in mySqlDao
    mySqlDao.getAllStudents()
        // create a promise
        .then((result) => {
            // render listStudents page and pass results down
            res.render('listStudents', {students:result})
        })
        .catch((error) => {
            // catch and display any error
            res.send(error)
        })
})

// get request to /students/delete/:sid for deleting students from the db
app.get('/students/delete/:sid', (req, res) => {
    // call deleteStudent in mySqlDao and pass sid 
    mySqlDao.deleteStudent(req.params.sid)
        // create a promise
        .then((result) => {
            // if else to check for affected rows if none are affected 
            if (result.affectedRows == 0) {
                // send student doesn't exist
                res.send("<h2>Student " + req.params.sid + " doesn't exist</h2>")
            }
            else {
                // if rows are affected redirect to /listStudents
                res.redirect('/listStudents')
            }
        })
        .catch((error) => {
            // catch error for when a student has associated modules they can't be deleted
            if (error.code == "ER_ROW_IS_REFERENCED_2") {
                // render deleteError and pass sid down
                res.render('deleteError', {sid:req.params.sid})
            }
            else {
                // catch any other error and display the errno and sqlMessage
                res.send("<h2>Error: " + error.errno + " " + error.sqlMessage + "</h3>")
            }
        })
})

// get request to /addStudent to add a student to the db
app.get('/addStudent', (req, res) => {
    // render addStudent page and pass no errors and define all other parameters as blank
    res.render('addStudent', {errors:undefined, dupe:"", sid:"", name:"", gpa:""})
})

// post request to /addStudent
app.post('/addStudent', 
[
// validation checks and error messages
check('sid').isLength({min:4, max:4}).withMessage("Student ID must be 4 characters"),
check('name').isLength({min:5}).withMessage("Name must be at least 5 characters"),
check('gpa').isFloat({min:0.0, max:4.0}).withMessage("GPA must be between 0.0 & 4.0")
],
(req, res) => {
    // create a student variable to pass in addStudent method
    var student = [req.body.sid, req.body.name, req.body.gpa]
    // set errors = validationResult
    var errors = validationResult(req)

    // if there are errors don't continue
    if (!errors.isEmpty()) {
        // render addStudent page and pass errors, leave dupe blank and pass the req.body of the other parameters
        res.render('addStudent', {errors:errors.errors, dupe:"", sid:req.body.sid, name:req.body.name, gpa:req.body.gpa})
    }
    else {
        // if there are no errors continue to call addStudent in mySqlDao and pass student variable 
        mySqlDao.addStudent(student)
            // create a promise
            .then((result) => {
                // log the result
                console.log(result)
                // redirect to listStudents page
                res.redirect('/listStudents')
            })
            .catch((error) => {
                // catch and log errors
                console.log(error)
                // for dupe error re-render page and pass down errors and req.body of parameters and write the error message for dupe
                res.render('addStudent', {errors:errors.errors, dupe:"Error: " + error.code + ": " + error.sqlMessage, sid:req.body.sid, name:req.body.name, gpa:req.body.gpa})
            })
    } 
})

// get request to /listLecturers to display all lecturers
app.get('/listLecturers', (req, res) => {
    // call getLecturers in mongoDao
    mongoDao.getLecturers()
        // create a promise
        .then((documents) => {
            // render listLecturers page and pass documents
            res.render('listLecturers', {lecturers:documents})
        })
        .catch((error) => {
            // catch and display any error
            res.send(error)
        })
})

// get request to /addLecturer to add a new lecturer
app.get('/addLecturer', (req, res) => {
    // render addLecturer page and pass no error and parameters as blank
    res.render('addLecturer', {errors:undefined, dupe:"", _id:"", name:"", dept:""})
})

// post request to /addLecturer
app.post('/addLecturer', 
[
// validation check and error messages
check('_id').isLength({min:4, max:4}).withMessage("Lecturer ID must be 4 characters"),
check('name').isLength({min:5}).withMessage("Name must be at least 5 characters"),
check('dept').isLength({min:3, max:3}).withMessage("Dept must be 3 characters")
],
(req, res) => {
    // set errors = validationResult
    var errors = validationResult(req)
    
    // if there are errors don't continue
    if (!errors.isEmpty()) {
        // render addLecturer page and pass errors, dupe as blank and req.body for other parameters
        res.render('addLecturer', {errors:errors.errors, dupe:"", _id:req.body._id, name:req.body.name, dept:req.body.dept})
    }
    else {
        // if there are no errors continue to call addLecturer method in mongoDao and pass the _id, name and dept
        mongoDao.addLecturer(req.body._id, req.body.name, req.body.dept)
            // create a promise
            .then((result) => {
                // log the result
                console.log(result)
                // redirect to /listLecturers page
                res.redirect("/listLecturers")
            })
            .catch((error) => {
                // if error message has 11000 in it its a duplication error
                if(error.message.includes("11000")){
                    // render addLecturer and pass errors and set dupe to Id already exists for the error code 11000, pass the req.body of _id, name and dept too
                    res.render('addLecturer', {errors:errors.errors, dupe:"ID already exists", _id:req.body._id, name:req.body.name, dept:req.body.dept})
                }
                else {
                    // catch and display any other errors
                    res.send(error.message)
                }
            })
    }
})

// get request to /lecturers/delete/:_id for deleting a lecturer
app.get('/lecturers/delete/:_id', (req, res) => {
    // call deleteLecturer in mongoDao and pass _id
    mongoDao.deleteLecturer(req.params._id)
        // create a promise
        .then((result) => {
            // check for no affected rows
            if (result.affectedRows == 0) {
                // if there are none display that the lecturer doesn't exist
                res.send("<h2>Lecturer " + req.params._id + " doesn't exist</h2>")
            }
            else {
                // if there are affected rows redirect to /listLecturers
                res.redirect('/listLecturers')
            }
        })
        .catch((error) => {
            // catch any log any other errors
            console.log(error)
        })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})