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
    const { user_id } = req.params;
    const id = parseInt(req.params["user_id"]);
    prisma.user.findMany({
      where: {
        user_id: id
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

  async function getUserCharacters(req,res){
    const user_id = parseInt(req.query.id);
    const result = await global.prisma.character_sheet.findMany({
      where:{owner_id:user_id},
      select: {
          firstname:true,lastname:true,race:true,character_id:true,character_icon:true,
          character_classes: {
            select: {
              class_name:true,level:true,subclass:true
            }
          },
      },
    })

    let characterArray = []
    let returnValue
    try {
      result.forEach(elem => {
        characterArray.push(createCharacter(elem))
      })
      returnValue = characterArray
    } catch (error) {
      console.log(error)
       returnValue = res.status(400).json({
        message:"something went wrong while retrieving the characters please try again"
      })
    }

    return returnValue
  }

  function createCharacter(value){
    const id = value.character_id
    const firstname = value.firstname;
    const lastname = value.lastname;
    const race = value.race;
    const characterIcon = value.character_icon 
    const classValue = value.character_classes

    let classes = []
    let subClasses = []
    let level = []

    classValue.forEach(elem=>{
      classes.push(elem.class_name)
      if(elem.subclass !== null)subClasses.push(elem.subclass)
      level.push(elem.level)
    })    

    const character = {
      id,
      firstname,
      lastname,
      race,
      classes,
      school:subClasses,
      level:level.reduce((pSum,a) => pSum + a,0),
      classLevel:level,
      characterIcon
    }
    return character
  }


module.exports = {
  getUser,
  getUsers,
  createUser,
  loginUser,
  getUserCharacters,
}
