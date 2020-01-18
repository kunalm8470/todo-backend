const Parent = require('../models/parent');

class PersonController {
    constructor() {
    }

    getAllParents(req, res, next) {
        Parent.find({})
        .exec((err, parents) => {
            if (err) {
                return next(err);
            }
            return res.status(200).json(parents);
        });
    }

    getParentById(req, res, next) {
        Parent.findById(req.params.id)
        .exec((err, parent) => {
            if (err) {
                return next(err);
            }

            return res.status(200).json(parent);
        });
    }

    addParent(req, res, next) {
        if (!req.body.name) {
            return res.status(400).json({
                error: {
                    message: 'Add Parent name in the request body!'
                }
            });
        }

        Parent.findOne({ name: req.body.name })
              .exec((err, foundParent) => {

                if (err) {
                    return next(err);
                }

                if (foundParent) {
                    return res.status(409).json({
                        message: 'Duplicate Parent!',
                        match: [foundParent]
                    });
                }

                const parent = new Parent({
                    name: req.body.name,
                    children: req.body.children || []
                });

                parent.save()
                      .then(data => res.status(201).json(data))
                      .catch(next);
              });     
    }

    addChildToParent(req, res, next) {
        if (!req.params.parentId) {
            return res.status(400).json({
                error: {
                    message: 'Add ParentId in the request route parameter!'
                }
            });
        }

        if (!req.body.children) {
            return res.status(400).json({
                error: {
                    message: 'Request body cannot be empty, add children in the request body!'
                }
            });
        }

        Parent.findById(req.params.parentId)
              .exec((err, foundParent) => {
                if (err) {
                    return next(err);
                }

                if (!foundParent) {
                    return res.status(404).json({
                        message: `Parent not found with ID: ${req.params.parentId}`
                    });
                }

                req.body.children.forEach(x => {
                    if (!foundParent.children.some(y => y.name.toLowerCase() === x.name.toLowerCase())) {
                        foundParent.children.push(x);
                    }
                });

                foundParent.save()
                .then(data => res.status(201).json(data))
                .catch(next);
        });
    }
}

module.exports = PersonController;