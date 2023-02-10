const express = require('express')
const router = express.Router();

const { validateToken } = require('../middleware/UserValidationMiddleware')
const characterService = require('../services/characterService.js');

router.get('/character/:character_id',validateToken,(req,res) => {
  setTimeout(()=> {
    // characterService.getCharacter(req,res)
    characterService.getCharacterSheet(req,res)
  },000)
})


module.exports = router