const Student = require('../models/student');

class StudentController {
    constructor() {
    }

    getAllStudents(req, res, next) {
        Student.find({}).exec((err, data) => {
            if (err) {
                return next(err);
            }

            return res.status(200).json(data);
        });
    }

    getStudentById(req, res, next) {
        Student.findById(req.params.id).exec((err, data) => {
            if (err) {
                return next(err);
            }

            return res.status(200).json(data);
        });
    }

    addStudent(req, res, next) {
        if (!req.body.name) {
            return res.status(400).json({
                error: {
                    message: 'Add Student name in the request body!'
                }
            });
        }

        if (!req.body.dateOfBirth) {
            return res.status(400).json({
                error: {
                    message: 'Add Student\'s date-of-birth in the request body!'
                }
            });
        }

        Student.findOne({ name: req.body.name })
                .exec((err, foundStudent) => {
                    if (err) {
                        return next(err);
                    }
 
                    if (foundStudent) {
                        return res.status(409).json({
                            message: 'Student already exists',
                            match: [
                                foundStudent
                            ]
                        });
                    }

                    const student = new Student({
                        name: req.body.name,
                        dateOfBirth: req.body.dateOfBirth
                    });

                    student.save()
                    .then(data => res.status(201).json(data))
                    .catch(next);
                });
    }
}

module.exports = StudentController;