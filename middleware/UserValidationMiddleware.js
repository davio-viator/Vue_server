const jwt = require("jsonwebtoken");
const dotenv = require('dotenv')
dotenv.config()
const crypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET

const isEmail = (email) => {
  const res = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return res.test(String(email).toLowerCase());
}

function ValidateRegistration(req, res,next) {
  const username = req.body.username;
  const email = req.body.email;
  const status = req.body.status;
  const password = req.body.password;
  const verify_password = req.body.verify_password; 
  // console.log(password,verify_password);
  if(!username || username.length < 3){
    return res.status(400).json({
      message: "Username must be at least 4 characters long",
      status:400
    });
  }

  if(!password || password.length < 8){
    return res.status(400).json({
      message: "Password must be at least 8 characters long",
      status:400
    });
  }

  if(!verify_password || password !== verify_password){
    return res.status(400).json({
      message: "The passwords given do not match",
      status:400
    });
  }

  if(!status || !['DM','Player'].includes(status)){
    return res.status(400).json({
      message: "The status given must be a valid status",
      status:400
    })
  }

  if(!email || !isEmail(email) ){
    return res.status(400).json({
      message: "The email must be of valid format",
      status:400
    })
  }

  next();
}

function ValidateLogin(req, res,next) {  
  const prisma = global.prisma;
  const email = req.body.email;
  const password = req.body.password;

  return prisma.user.findFirst({
    where : {email:email,},
    select:{password: true,username:true,firstname:true,lastname:true,user_id:true,icon:true},
  })
    .then(result => {
      const passwordIsCorrect = crypt.compareSync(password,result.password)
      req.body.username = result.username;
      req.body.firstname = result.firstname;
      req.body.lastname = result.lastname;
      req.body.id = result.user_id;
      req.body.icon = result.icon
      console.log(req.body)
      if(!passwordIsCorrect) {
        res.status(400).json({
          message:"Wrong password try again",
          status:400
        })
      }
      else next()
    })

    .catch(err => {
      console.log(err);
      res.status(500).json({
        message:"Something went wrong",
        status:500
      })
    })

}

function validateToken(req,res,next){
  try {  
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(
      token,
      JWT_SECRET
      );
      req.userData = decoded;
    next();
  } catch (err) {
    return res.status(401).send({
      msg: 'Your session is not valid!'
    });
  }
}

module.exports = {
  ValidateRegistration,
  ValidateLogin,
  validateToken
}