// const connection = require('./lib/db.js')
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const app = express();
const path = require('path');
const port = 3080;
const cors = require('cors')
const  { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
global.prisma = prisma

app.use(bodyParser.json({limit: '3mb'}))
app.use(cors());
app.use(express.static(path.join(__dirname,'build')));
app.use(fileUpload())
app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Header','Content-Type, Authorization');
  next();
});

const character_router = require('./routes/character_router.js');
const user_router = require('./routes/user_router.js')
const card_router = require('./routes/card_router')
const note_router = require('./routes/note_router')
app.use('/api/v1',character_router,user_router,card_router,note_router)

const cards = []

app.get('/api/cards',(req,res) => {
  res.json(cards)
})

app.post('/api/card', (req,res) => {
  const card = req.body.card;
  console.log("adding card:::::::",card.name);
  let oldlength = cards.length;
  let newlength = cards.push(card)
  if(newlength>oldlength) res.status(200).send({res: "card added"})
  else res.sendStatus(500)
})



app.listen(port, () => {
  console.log(`Server listening on the port::${port}`)
})