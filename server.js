const connection = require('./lib/db.js')
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const app = express();
const path = require('path');
const port = 3080;
const cors = require('cors')

app.use(bodyParser.json())
app.use(cors());
app.use(express.static(path.join(__dirname,'build')));
app.use(fileUpload())
app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Header','Content-Type, Authorization');
  next();
});

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