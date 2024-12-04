const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookConroller');
const {verifyToken,isAdmin, hasRole}=require('../middleware/auth');

// create book
router.post('/book',verifyToken,isAdmin ,bookController.createbook);
///update book
router.put('/book/:id',verifyToken,isAdmin ,bookController.updateBook);
//delete book
router.delete('/book/:id',verifyToken,isAdmin ,bookController.deleteBook);
//view all books
router.get('/book',verifyToken,hasRole(['Librarian', 'Member']) ,bookController.getBooks);


module.exports = router;
