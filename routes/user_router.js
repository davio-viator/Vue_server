const express = require('express')
const router = express.Router();

const userService = require('../services/userService.js')

router.get('/user/',(req,res) => {
  userService.getUsers(req,res)
})

router.get('/user/:user_id',(req,res) => {
  userService.getUser(req,res)
})

router.post('/user',(req,res) => {
  userService.createUser(req,res)
})


module.exports = router