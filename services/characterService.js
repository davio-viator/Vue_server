// const  { PrismaClient } = require('@prisma/client')

const spellSlots = require('./spellSlots.js')


const SpellcastingAbility = {
  artificier:"intelligence",
  wizard:"intelligence",
  bard:"charisma",
  paladin:"charisma",
  sorcerer:"charisma",
  warlock:"charisma",
  cleric:"wisdom",
  druid:"wisdom",
  ranger:"wisdom",
  "Eldritch Knight":"intelligence",
  "Arcane Trickster":"intelligence",
  "Way of the Four Elements":"wisdom",
}




function parseClasses(value){
    const classValue = value.character_classes

    let classes = []
    let subClasses = []
    let level = []

    classValue.forEach(elem=>{
      classes.push(elem.class_name)
      if(elem.subclass !== null)subClasses.push(elem.subclass)
      level.push(elem.level)
    })    

    const character = {
      classes,
      school:subClasses,
      level:level.reduce((pSum,a) => pSum + a,0),
      classLevel:level,
    }
    return character
}

function calculateBonus(score){
  return Math.floor((score-10)/2)
}

async function getCharacterSheet(req,res){
  let  {character_id} = req.params;
  character_id = parseInt(character_id);
  const response = await global.prisma.character_sheet.findMany({
    where : {character_id:character_id},
    include :  {
      character_classes: {
        select: { class_name:true, level:true, subclass:true }
      },
      saving_throws:{
        select: { name:true, mod:true, proficient:true }
      },
      senses:{
        select: { perception:true, investigation:true, insight:true }
      },
      proficiencies : {
        select: { armors:true, weapons:true, tools:true, languages: true }
      },
      skills : {
        select : { name: true, proficient: true, modifier: true, bonus:true }
      },
      stats : {
        select : { name:true, score:true }
      },
      character_sheet_custom_action:{
        select : { action_custom:true }
      }
    },
  })
  try {
    const character_sheet = response[0];
    await getInventory(character_sheet)
    handleCharacterSheet(character_sheet);
    return res.status(200).json({character:character_sheet})
  } catch (error) {
    console.log(error);
    res.status(400).json({message:"Couldn't retrieve the character sheet"})
  }
}

function handleCharacterSheet(character_sheet) {
  handleStatsBonus(character_sheet);
  handleClasses(character_sheet);
  calculateSpellDc(character_sheet);
  handleCharacterActions(character_sheet);
  handleCharacterSpells(character_sheet);
  handleProficiencies(character_sheet);
  handleHealth(character_sheet);
  handleStatus(character_sheet);
  handleSavingThrows(character_sheet);
  handleSenses(character_sheet);
}

function calculateSpellDc(character_sheet){ 
  const classes = character_sheet.character_classes
  let spellAbility = ""
  classLevel = 0
  classes.forEach(elem => {
    if(classLevel < elem.level){
      spellAbility = SpellcastingAbility[elem.class_name]
      if(spellAbility === undefined) spellAbility = SpellcastingAbility[elem.subclass]
      classLevel = elem.level
    }
  })
  const dc = 8 + getstat(character_sheet,spellAbility)?.bonus + character_sheet.proficiency
  character_sheet.spellDc = dc
}

function getSpellModifier(character_sheet){
  const classes = character_sheet.character_classes
  let spellAbility = ""
  let classLevel = 0
  classes.forEach(elem => {
    if(isSpellCasterClass(elem,classLevel)){
      spellAbility = SpellcastingAbility[elem.class_name]
      if(spellAbility === undefined) spellAbility = SpellcastingAbility[elem.subclass]
      classLevel = elem.level
    }
  })
  const modifier = getstat(character_sheet, spellAbility)?.bonus
  return modifier
}


function isSpellCasterClass(elem,level=null) {
  if(level!== null ) return elem.level > level && Object.keys(SpellcastingAbility).includes(elem.class_name)
  return Object.keys(SpellcastingAbility).includes(elem.class_name)
}

function getstat(character_sheet, name) {
  return character_sheet.stats.find(el => el.name === name);
}

function handleCharacterActions(character_sheet){
  const unparsedActions = character_sheet.character_sheet_custom_action;
  // console.log(unparsedActions);
  const actions = {}
  actions.attacks = []
  actions.action = []
  unparsedActions.forEach(item => {
    const action = item.action_custom
    handleSpellDc(action, character_sheet);
    if(action.isAttack) {
      handleWeaponProficiencies(action,character_sheet)
      if(action.isSpell) handleSpellProfiencies(action,character_sheet)
      actions.attacks.push(action);
    }
    if(action.isFeature) actions.action.push(action)
    // console.log(action);
  })
  character_sheet.actions = actions
}

function handleSpellDc(action, character_sheet) {
  if (action.hit_dc !== null && !Number.isInteger(parseInt(action.hit_dc))) {
    const dc = `${character_sheet.spellDc}|${action.hit_dc}`;
    action.hit_dc = dc;
  }
}

function handleWeaponProficiencies(action,character_sheet){
  const properties = action?.properties
  if(properties){
    const propertiesArray = properties.split(',');
    const weapons_proficiencies = character_sheet.proficiencies.weapons
    propertiesArray.forEach(item => {
      if(weapons_proficiencies.includes(item)){
        handleProficiencyBonus(action,character_sheet)
      }
    })
    
  }
}

function handleSpellProfiencies(action,character_sheet){
  const properties = action?.properties
  if(properties){
    if(properties.includes('variable')){
      const modifier = getSpellModifier(character_sheet)
      action.damage = `${action.damage}+${modifier}`
    }
  }
}

function handleProficiencyBonus(action,character_sheet){
  const strengthBonus = character_sheet.stats.find(el => el.name === 'strength').bonus
  const dexterityBonus = character_sheet.stats.find(el => el.name === 'dexterity').bonus
  const bestState = findBestStat(strengthBonus,dexterityBonus)
  if(action.properties.includes('Finesse')){
    action.damage += `+${bestState}`
  }
  else action.damage += `+${strengthBonus}`
}

function findBestStat(strength,dexterity){
  return strength > dexterity ? strength : dexterity
}

function handleCharacterSpells(character_sheet){
  const unparsedSpells = character_sheet.character_sheet_custom_action;
  // const spells = {};/
  const spells = handleSpellSlots(character_sheet);
  unparsedSpells.forEach(item => {
    const spell = item.action_custom
    if(spell.isSpell){
      const level = getSpellLevel(spell.level);
      spells[level].spells.push(spell)
    }
  })
  character_sheet.spells = spells
}

function handleSpellSlots(sheet){
  const classes = sheet.character_classes
  let level = 0
  const returnSlots = {}
  returnSlots.Cantrip = {slots:-1,used:-1,spells:[]}
  for(item in classes){
    const cclass = classes[item] 
    if(isSpellCasterClass(cclass,level)){
      const classLevel = cclass.level.toString();
      const className = cclass.class_name
      const slotsAvailable = spellSlots[className][classLevel]
      level = cclass.level
      Object.keys(slotsAvailable).forEach(elem => {
        returnSlots[elem] = {slots:slotsAvailable[elem],used:0,spells:[]}
      })
    }
  }
  return returnSlots
}

function testParams(){
  for (let i = 0; i < arguments.length; i++) {
    const element = arguments[i];
    console.log(element);
  }
}

function handleHealth(character_sheet){
  character_sheet.health = {}
  character_sheet.health.max = character_sheet.maxhp
  character_sheet.health.current = character_sheet.currenthp
  character_sheet.health.temp = character_sheet.temphp
  delete character_sheet.maxhp
  delete character_sheet.currenthp
  delete character_sheet.temphp
}

function handleStatus(character_sheet){
  character_sheet.defences = character_sheet.defences?.split(',')
  character_sheet.conditions = character_sheet.conditions?.split(',')
}

function handleClasses(character_sheet){
  const parse = parseClasses(character_sheet);
  character_sheet.level = parse.level
  character_sheet.class = parse.classes
  character_sheet.classLevel = parse.classLevel

}

function handleSavingThrows(character_sheet){
  character_sheet.savingthrows = character_sheet.saving_throws;
  delete character_sheet.saving_throws
}

function handleSenses(character_sheet){
  character_sheet.senses = Object.keys(character_sheet.senses).reduce((a,b) => {
    const newName = 'passive_'+b;
    a[newName] = character_sheet.senses[b];
    return a
  },{})
  // console.log(character_sheet);
}

function handleStatsBonus(character_sheet){
  character_sheet.stats.forEach(elem => {
    elem.bonus = calculateBonus(elem.score)
  });
  // console.log(character_sheet);
}

function handleProficiencies(character_sheet){
  character_sheet.proficiencies.armors = character_sheet.proficiencies.armors.split(',') 
  character_sheet.proficiencies.weapons = character_sheet.proficiencies.weapons.split(',') 
  character_sheet.proficiencies.tools = character_sheet.proficiencies.tools.split(',') 
  character_sheet.proficiencies.languages = character_sheet.proficiencies.languages.split(',')
  // console.log(character_sheet); 
}

function getSpellLevel(level){
  levelArray = [
      "Cantrip",
    "1st Level",
    "2nd Level",
    "3rd Level",
    "4th Level",
    "5th Level",
    "6th Level",
    "7th Level",
    "8th Level",
    "9th Level",
  ]
  return levelArray[level]
}

async function getInventory(character_sheet){
  const response = await global.prisma.character_sheet.findUnique({
    where : {character_id:character_sheet.character_id},
    include : {
      character_inventory: {
        select : { 
          item: true ,equipped:true ,location:true, quantity:true
        }
      },
    }
  })

  try {
    // console.log(response);
    const inventory = response.character_inventory
    // console.log(inventory);
    const equipement = []
    const backpack = []
    for(i in inventory){
      const item = inventory[i]
      // console.table(item);
      // console.log(item.location);
      if(item.location === "Backpack"){
        if(!item.item.equipable) item.item.active = -1
        else if(item.equipped) item.item.active = 1
        else if(!item.equipped) item.item.active = 0
        delete item.equipped
        delete item.location
        delete item.item.item_id
        backpack.push(item.item)
      }
      if(item.location === "Equipment"){
        console.log(item);
        if(!item.item.equipable) item.item.active = -1
        else if(item.equipped) item.item.active = 1
        else if(!item.equipped) item.item.active = 0
        delete item.equipped
        delete item.location
        delete item.item.item_id
        equipement.push(item.item)
        console.log(item);
      }      
    }
    // console.table({equipement});
    // console.table({backpack});
    character_sheet.inventory = {
      copper:1,
      silver:2,
      electrum:3,
      gold:12,
      platinum:4,
      hasBackpack:true,
      hasAlmsBox:true,
      equipment: [],
      almsBox:[],
      backpack:[]
      
    }
    equipement.forEach(elem => {
      // console.log(elem);
    })
    backpack.forEach(elem => {
      // console.log(elem);
    })
    console.log(equipement);
    if(backpack.length>0) character_sheet.inventory.backpack = backpack
    character_sheet.inventory.equipment = equipement
    // character_sheet.inventory.backpack = backpack
  } catch (error) {
    
  }
}


module.exports = {
  getCharacterSheet
}
