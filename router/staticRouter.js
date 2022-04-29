const router = require('express').Router()
const staticController = require('../controller/staticController')

 router.get('/userList', staticController.userList);
router.get('/viewUser/:_id', staticController.viewUser);

router.get('/staticList', staticController.staticList);
router.get('/viewStatic', staticController.viewStatic);

//router.put('/editStatic', staticController.editStatic);


module.exports = router;