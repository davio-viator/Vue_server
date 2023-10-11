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

router.put('/character/:character_id',(req,res) => {
  characterService.updateActiveEquipment(req,res)
})

router.get('/getcharacter/equipment',async (req,res)=> {
  try {
    await characterService.getEquipment();
    res.send()
  } catch (error) {
    
  }
})

router.get('/armor',async (req,res)=> {
  try {
    const x = await characterService.getArmor(req,res)
    console.log(x);
    res.send(x)
  } catch (error) {
    
  }
})

router.get('/weapon',async (req,res)=> {
  try {
    const x = await characterService.getWeapon(req,res)
    console.log(x);
    res.send(x)
  } catch (error) {
    
  }
})

router.get('/magic-item', async (req,res) => {
  try {
    const x = await characterService.getMagicItem(req,res)
    // console.log(x);
    res.send(x)
  } catch (error) {
    
  }
})

router.get('/tools',async (req,res) => {
  try {
    const x = await characterService.getTools(req,res)
    // console.log(x);
    res.send(x)
  } catch (error) {
    
  }
})

router.get('/gear',async (req,res) => {
  try {
    const x = await characterService.getAdventureGear(req,res)
    // console.log(x);
    res.send(x)
  } catch (error) {
    
  }
})

router.get('/mount',async (req,res)=> {
  try {
    const x = await characterService.getMounts(req,res)
    // console.log(x);
    res.send(x)
  } catch (error) {
    
  }
})

router.get('/spell',async (req,res) => {
  try {
    const x = await characterService.getSpells(req,res)
    res.send(x)
  } catch (error) {
    
  }
})

router.get('/get-weapons',async (req,res) => {
  try {
    const x = await characterService.getEquipmentDb(req,res)  
    res.send(x)
  } catch (error) {
    
  }
})

router.get('/weapon-action',(req,res) => {
  characterService.getWeaponAction(req,res)
})

router.patch('/hp',async (req,res) => {
  try {
    const x = await characterService.updateHp(req,res)
    res.send(x)
  } catch (error) {
    res.status(400).send(error)
  }
});

router.patch('/inspiration',async (req,res) => {
  try {
    const x = await characterService.setInspiration(req,res);
    res.send(x)
  } catch (error) {
    console.log(error);
    res.status(400).send(error)
  }
})

router.patch('/spell-slots', async (req,res) => {
  try {
    const x = await characterService.updateSpellSlots(req,res);
  } catch (error) {
    return error
  }
});

module.exports = router