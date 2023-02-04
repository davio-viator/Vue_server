// const  { PrismaClient } = require('@prisma/client');
const { PasswordEncryptor } = require('../services/encryptor')
const { createToken} = require('../modules/TokenMaker.js')

const prisma = global.prisma;

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
    // const id = parseInt(req.params["user_id"]);
    const { user_id } = req.params;
    prisma.user.findMany({
      where: {
        user_id: user_id
      }
    })
      .then(result => {
        if(result.length === 0) res.status(404).json({message:`The user ${user_id} doens't exist`})
        else res.json(result)
      })
      .catch(err => {
        res.send(err)
      })
  }

  function createUser(req,res) {
    let clone = {...req.body}
    // let otherClone = Object.assign({},req.body);
    console.log("body: ",req.body)
    const jwt = createToken(req,res);
    let hashedpassword = PasswordEncryptor(req,res);
    clone.password = hashedpassword
    delete clone.verify_password 
    prisma.user.create({
      data:clone
    })
    .then(result => {
      console.log("result: ",result)
      res.json({message:" user sucessfully added",token:jwt})
    })
    .catch(err => {
      if(err.code === 'P2002') res.status(400).json({message: "this e-mail address is already used",status: 400})
      else res.status(500).json({message:"Couldn't create the user",status:400})
    })
  }

  async function loginUser(req,res) {
    const redirectUrl = req.get('origin')+'/'
    const token = await createToken(req,res) 
    console.log(token)
    console.log(req.userData)
    res.status(200).json({message:'loggedIn',token})
    // res.status(200).json({message:'loggedIn',status:200,redirectUrl:redirectUrl})
  }


module.exports = {
  getUser,
  getUsers,
  createUser,
  loginUser
}
