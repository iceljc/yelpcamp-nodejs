const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const userController = require('../controllers/users');

// register
router.route('/register')
    .get(userController.renderRegister)
    .post(catchAsync(userController.register))

// login
router.route('/login')
    .get(userController.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), userController.login)

// logout
router.get('/logout', userController.logout)



module.exports = router;