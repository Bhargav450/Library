const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login route
router.post('/login', authController.login);
///register
router.post('/register',authController.registration);
//manage users


module.exports = router;
