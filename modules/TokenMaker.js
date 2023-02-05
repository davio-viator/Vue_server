const jwt = require('jsonwebtoken')
const env = require('dotenv');
env.config()
const JWT_SECRET = process.env.JWT_SECRET

async function createToken(req,res){
  let username = req.body.username;
  const email = req.body.email;
  const firstname = req.body?.firstname;
  const lastname = req.body?.lastname;
  
  if(!!!username){ //if there is no username given
    let usernameDB = await global.prisma.user.findMany({
      where: { email:email }, select:{ username: true }, take:1
    })

    username = usernameDB[0].username 
  }

  const token = jwt.sign({
      username: username,
      email: email,
      firstname,
      lastname
    },
    JWT_SECRET, {
      expiresIn: '7d'
    }
  );
  return token
}

module.exports = {
  createToken
}