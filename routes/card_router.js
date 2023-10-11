const express = require('express')
const router = express.Router();

const { createCard, getCards, deleteCards, getCardNote} = require('../services/cardService')

router.post('/card',(req,res) => {
  createCard(req,res);
})

router.get('/cards',(req,res) => {
  getCards(req,res);
})

router.delete('/cards',(req,res) => {
  deleteCards(req,res);
})

// router.get('/note',(req,res) => {
//   getCardNote(req,res)
// })


module.exports = router