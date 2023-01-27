// const { isEmail } = require('validator/es/lib/isEmail');
const  { PrismaClient } = require('@prisma/client');
const crypt = require('bcryptjs');

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
  console.log(password,verify_password);
  if(!username || username.length < 3){
    return res.status(400).json({
      message: "The username needs to be more than 3 characters",
      status:400
    });
  }

  if(!password || password.length < 8){
    return res.status(400).json({
      message: "The password needs to be at least 8 characters long",
      status:400
    });
  }

  if(!verify_password || password !== verify_password){
    return res.status(400).json({
      message: "The passwords aren't matching",
      status:400
    });
  }

  if(!status || !['DM','Player'].includes(status)){
    return res.status(400).json({
      message: "the status given must be a valid status",
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
  const prisma = new PrismaClient();
  const email = req.body.email;
  const password = req.body.password;

  return prisma.user.findFirst({
    where : {email:email,},
    select:{password: true,},
  })
    .then(result => {
      const passwordIsCorrect = crypt.compareSync(password,result.password)
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

module.exports = {
  ValidateRegistration,
  ValidateLogin,
}