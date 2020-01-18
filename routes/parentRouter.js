const express = require('express');
const parentController = require('../controllers/parentController');
const ParentController = new parentController();

const router = express.Router();

router.get('/', ParentController.getAllParents);
router.get('/:id', ParentController.getParentById);
router.post('/', ParentController.addParent);
router.post('/:parentId/children', ParentController.addChildToParent);

module.exports = router;