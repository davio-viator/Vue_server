// const  { PrismaClient } = require('@prisma/client');
const { PasswordEncryptor } = require('../services/encryptor')
const { createToken} = require('../modules/TokenMaker.js')
const { uploadImage } = require('../modules/Uploader')

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

  async function createUser(req,res) {
    let clone = {...req.body}
    // let otherClone = Object.assign({},req.body);
    console.log("body: ",req.body)
    const jwt = await createToken(req,res);
    let hashedpassword = PasswordEncryptor(req,res);
    const src = await uploadImage(req,res)
    console.log(src)
    clone.icon = src ? src : clone.icon.replace('/src/','./')
    clone.password = hashedpassword
    delete clone.verify_password 
    delete clone.imgFile
    console.log(clone)
    prisma.user.create({
      data:clone
    })
    .then(result => {
      console.log("result: ",result)
      const userObj = {
        id:result.user_id,
        username:result.username,
        icon:result.icon,
        firstname:result.firstname,
        lastname:result.lastname
      }
      res.json({message:" user sucessfully added",token:jwt,user:userObj})
    })
    .catch(err => {
      console.log(err)
      if(err.code === 'P2002') res.status(400).json({message: "this e-mail address is already used",status: 400})
      else res.status(500).json({message:"Couldn't create the user",status:400})
    })
  }

  async function loginUser(req,res) {
    const redirectUrl = req.get('origin')+'/'
    const token = await createToken(req,res) 
    const userObj = {
      id:req.body.id,
      username:req.body.username,
      icon:req.body.icon,
      firstname:req.body.firstname,
      lastname:req.body.lastname
    }
    res.status(200).json({message:'loggedIn',token,user:userObj})
    // res.status(200).json({message:'loggedIn',status:200,redirectUrl:redirectUrl})
  }


module.exports = {
  getUser,
  getUsers,
  createUser,
  loginUser
}
