const express = require('express');

const { createUser, login } = require('../controllers/userAuthController');

const userRouter = express.Router();
userRouter.post("/register", createUser);
userRouter.post("/login", login);

module.exports = userRouter;
