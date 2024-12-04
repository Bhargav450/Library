const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {verifyToken,isAdmin}=require('../middleware/auth');

console.log("inside userRoutes");
// add user route
router.post('/', verifyToken,isAdmin,userController.createUser);
//update user route
router.put('/:id', verifyToken,isAdmin,userController.updateUser);
//delete user route
router.delete('/:id',verifyToken,isAdmin,userController.deleteUser);
//manage users


module.exports = router;
