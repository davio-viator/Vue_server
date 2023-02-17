const express = require('express')
const router = express.Router();

const { validateToken } = require('../middleware/UserValidationMiddleware')
const characterService = require('../services/characterService.js');

router.get('/character/:character_id',validateToken,(req,res) => {
  setTimeout(async ()=> {
    // characterService.getCharacter(req,res)
    await characterService.getCharacterSheet(req,res)
  },000)
})

router.get('/getcharacter/equipment',async (req,res)=> {
  await characterService.getEquipment();
  try {
    res.send()
  } catch (error) {
    
  }
})

router.get('/armor',async (req,res)=> {
  const x = await characterService.getArmor(req,res)
  try {
    console.log(x);
    res.send(x)
  } catch (error) {
    
  }
})

router.get('/weapon',async (req,res)=> {
  const x = await characterService.getWeapon(req,res)
  try {
    console.log(x);
    res.send(x)
  } catch (error) {
    
  }
})

router.get('/magic-item', async (req,res) => {
  const x = await characterService.getMagicItem(req,res)
  try {
    // console.log(x);
    res.send(x)
  } catch (error) {
    
  }
})

router.get('/tools',async (req,res) => {
  const x = await characterService.getTools(req,res)
  try {
    // console.log(x);
    res.send(x)
  } catch (error) {
    
  }
})

router.get('/gear',async (req,res) => {
  const x = await characterService.getAdventureGear(req,res)
  try {
    // console.log(x);
    res.send(x)
  } catch (error) {
    
  }
})

router.get('/mount',async (req,res)=> {
  const x = await characterService.getMounts(req,res)
  try {
    // console.log(x);
    res.send(x)
  } catch (error) {
    
  }
})

router.get('/spell',async (req,res) => {
  const x = await characterService.getSpells(req,res)
  try {
    res.send(x)
  } catch (error) {
    
  }
})

router.get('/get-weapons',async (req,res) => {
  const x = await characterService.getEquipmentDb(req,res)
  try {
    res.send(x)
  } catch (error) {
    
  }
})

router.get('/weapon-action',(req,res) => {
  characterService.getWeaponAction(req,res)
})

module.exports = router