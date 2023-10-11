const express = require('express')
const router = express.Router();

const { getNotes, getUserCardNote, createNote, updateNote } = require('../services/noteService')


router.get('/note',(req,res) => {
  getNotes(req,res)
})

router.get('/note/:userId/:cardId',(req,res) => {
  getUserCardNote(req,res);
})

router.post('/note',(req,res) => {
  createNote(req,res);
})

router.patch('/note',(req,res) => {
  updateNote(req,res);
})

module.exports = router