const express = require('express');
const router = express.Router();
const borrowedBookController = require('../controllers/borrowBookController');
const {verifyToken, hasRole}=require('../middleware/auth');


// create book
router.post('/borrow-book',verifyToken,hasRole('Member') ,borrowedBookController.addBorrowBook);
//return book
router.patch('/return-book',verifyToken,hasRole('Member'),borrowedBookController.returnBook);



module.exports = router;
