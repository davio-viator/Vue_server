const express = require('express')
const router = express.Router();

const {ValidateRegistration, ValidateLogin, validateToken} = require('../middleware/UserValidationMiddleware')

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

router.post('/user-token',validateToken,(req,res) => {
  res.status(200).send('validated');
})

router.get('/characters',validateToken,async (req,res) => {
  const characterDb = await userService.getUserCharacters(req,res)
  try {
    res.status(200).json({characters:characterDb})
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
})

module.exports = router