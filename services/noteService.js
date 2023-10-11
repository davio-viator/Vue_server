const axios = require('axios')
const prisma = global.prisma;

function getNotes(){
  prisma.notes.findMany()
      .then( result => {
        res.send(result)
      })
      .catch(err => {
        res.send(err)
      })
}

function getUserCardNote(req,res){
  const userId = parseInt(req.params.userId)
  const cardId = parseInt(req.params.cardId)
  prisma.notes.findUnique({
    where: {
      card_id_user_id : {
        user_id:userId,
        card_id:cardId
      }
    },
    select:{title: true,content:true}
  })
  .then(results => {
    res.send(results)
  })
  .catch(err => {
    res.send(err)
  })
}

function createNote(req,res){
  const data = {
    user_id: req.body.user_id,
    card_id: req.body.card_id , 
    title: req.body.title, 
    content: req.body.content
  }
  prisma.notes.create({
    data
  })
  .then(result => {
    res.send(result)
  })
  .catch(err => {
    res.send(err)
  })
}

function updateNote(req,res){
  const data = {
    user_id: req.body.user_id,
    card_id: req.body.card_id , 
    
    content: req.body.content
  }
  prisma.notes.update({
    where:{
      card_id_user_id:{
        user_id:data.user_id,
        card_id:data.card_id,
      }
    },
    data:{
      content:data.content
    }
  })
  .then(result => {
    res.send(result)
  })
  .catch(err => {
    res.send(err).status(400)
  })

}

module.exports = {
  getNotes,
  getUserCardNote,
  createNote,
  updateNote
}
