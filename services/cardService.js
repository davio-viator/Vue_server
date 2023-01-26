const  { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient();


function createCard(req,res){
  clonedCard = {...req.body.card};
  clonedCard.keywords = clonedCard.keywords.join(',')
  clonedCard.strength = clonedCard.content.strength
  clonedCard.weakness = clonedCard.content.weakness
  clonedCard.ecology = clonedCard.content.ecology
  clonedCard.card_image = clonedCard.url
  delete clonedCard.content
  delete clonedCard.url
  prisma.card.create({
    data:clonedCard
  })
  .then(result => {
    res.send(result)
  })
  .catch(err=>{
    res.status(400).json({message:"Coudln't add the card"})
  })
}

function getCards(req,res){
  let skip = parseInt(req.query.skip)
  let take = parseInt(req.query.take)
  prisma.card.findMany({
    skip:skip,
    take:take
  })
    .then( result => {
      res.send(result)
    })
    .catch(err => {
      res.send(err)
    })

  prisma.card.findMany({
    
  })
}

function deleteCards(req,res){
  prisma.card.deleteMany()
    .then(result => {
      res.json({message:'All cards are deleted'})
    })
    .catch(err=>{
      res.status(400).json({message:"Couldn't delete the cards"})
    })
}

function getCardNote(req,res) {
  let id = parseInt(req.query.id)
  prisma.notes.findMany({
    where:{
      card_id:id
    }
  })
  .then(result => {
    console.log(result);
    res.send(result)
  })
}


module.exports = {
  createCard,
  getCards,
  deleteCards,
  getCardNote,

}
