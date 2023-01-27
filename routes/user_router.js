const express = require('express')
const router = express.Router();

const {ValidateRegistration, ValidateLogin} = require('../middleware/UserValidationMiddleware')

const userService = require('../services/userService.js')

router.get('/user/',(req,res) => {
  userService.getUsers(req,res)
})

router.get('/user/:user_id',(req,res) => {
  userService.getUser(req,res)
})

router.post('/user',ValidateRegistration,(req,res) => {
  userService.createUser(req,res)
})

router.post('/signIn',ValidateLogin,(req,res) => {
  userService.loginUser(req,res)
})


module.exports = router