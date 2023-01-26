const  { PrismaClient } = require('@prisma/client');
const { PasswordEncryptor } = require('../services/encryptor')

const prisma = new PrismaClient();

  function getUsers(req,res) {
    prisma.user.findMany()
      .then( result => {
        res.send(result)
      })
      .catch(err => {
        res.send(err)
      })
  }

  function getUser(req,res) {
    const id = parseInt(req.params["user_id"]);
    prisma.user.findMany({
      where: {
        user_id: id
      }
    })
      .then(result => {
        if(result.length === 0) res.status(404).json({message:`The user ${id} doens't exist`})
        else res.json(result)
      })
      .catch(err => {
        res.send(err)
      })
  }

  function createUser(req,res) {
    let clone = {...req.body}
    // let otherClone = Object.assign({},req.body);
    let hashedpassword = PasswordEncryptor(req,res);
    clone.password = hashedpassword
    prisma.user.create({
      data:clone
    })
    .catch(err => {
      res.status(400).json({message:"Couldn't create the user"})
    })
  }



module.exports = {
  getUser,
  getUsers,
  createUser
}
