const crypt = require('bcryptjs');

function PasswordEncryptor(req,res) {
  let salt = crypt.genSaltSync(10);
  let hash = crypt.hashSync(req.body.password,salt)
  return hash
}

module.exports = {
  PasswordEncryptor
}