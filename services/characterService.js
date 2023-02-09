// const  { PrismaClient } = require('@prisma/client')

const prisma = global.prisma

async function getCharacter(req,res){
  const {character_id} = parseInt(req.params)
  const id = parseInt(req.params['character_id'])
  // const characterDbOld = await prisma.character_sheet.findMany({
  //   where: { character_id:id }
  // })
  // test(id)
  getCharacterSheet(id)
  const characterDb = await global.prisma.character_sheet.findMany({
    where:{character_id:id},
    include: {
        character_classes: {
          select: { class_name:true, level:true, subclass:true }
        },
        saving_throws:{
          select: {name:true, mod:true, proficient:true}
        },
        senses:{
          select: {perception:true, investigation:true, insight:true}
        },
        proficiencies : {
          select: {armors:true, weapons:true, tools:true, languages: true}
        },
        skills : {
          select : {name: true, proficient: true, modifier: true, bonus:true}
        },
        stats : {
          select : {name:true, score:true}
        },
        character_actions : {
          select : {
            action : {
              select : { title:true, text:true, times: true, frequency:true, bonus: true }
            }
          }
        },
        character_attacks : {
          select : {
            isProficient:true,
            attack : {
              select: {
                name:true, 
                attack_icon:true, 
                attack_type:true, 
                range:true, 
                range_type:true, 
                hit_dc:true, 
                damage:true, 
                damage_icon:true, 
                bonus:true, 
                notes:true,
                isSpell:true
              }
            }
          }
        }
    },
  })
  try {
    const character = characterDb[0]
    character.health = {}
    character.health.max = character.maxhp
    character.health.current = character.currenthp
    character.health.temp = character.temphp
    character.defences = character.defences?.split(',')
    character.conditions = character.conditions?.split(',')
    const parse = parseClasses(character)
    character.level = parse.level
    character.class = parse.classes
    character.classLevel = parse.classLevel
    character.savingthrows = character.saving_throws;
    character.senses = Object.keys(character.senses).reduce((a,b) => {
      const newName = 'passive_'+b;
      a[newName] = character.senses[b];
      return a
    },{})
    character.stats.forEach(elem => {
      elem.bonus = calculateBonus(elem.score)
    })
    character.proficiencies.armors = character.proficiencies.armors.split(',') 
    character.proficiencies.weapons = character.proficiencies.weapons.split(',') 
    character.proficiencies.tools = character.proficiencies.tools.split(',') 
    character.proficiencies.languages = character.proficiencies.languages.split(',') 
    character.actions = {}
    character.actions.action = parseActions(character.character_actions)
    character.actions.attacks = parseAttack(character.character_attacks,character)
    delete character.maxhp
    delete character.currenthp
    delete character.temphp
    delete character.character_classes
    delete character.saving_throws
    delete character.character_actions
    delete character.character_attacks
    // console.log(character);
    return res.status(200).json({character:character})
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message:"Couldn't retrive the character"
    })
  }
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

function parseActions(actionArray){
  returnArray = []
  actionArray.forEach(element => {
    const action = {
      title:element.action.title,
      text:element.action.text,
      times:element.action.times,
      frequency:element.action.frequency,
      bonus:element.action.bonus
    }
    returnArray.push(action)
  });
  return returnArray
}

function parseAttack(attackArray, character) {
  returnArray = []
  attackArray.forEach(element => {
    let damage
    if(element.isProficient){
      const score = getStatBonus(character.stats,'strength');
      damage = `${element.attack.damage}+${score}`;
    }
    else {
      damage = element.attack.damage
    }
    const attack = {
      icon:element.attack.attack_icon,
      name:element.attack.name,
      attack_type:element.attack.attack_type,
      range:element.attack.range,
      range_type:element.attack.range_type,
      hit_dc:element.attack.hit_dc,
      damage:damage,
      damage_icon:element.attack.damage_icon,
      notes:element.attack.notes,
      bonus:element.attack.bonus,
      isProficient:element.isProficient,
      isSpell:element.attack.isSpell
    }
    returnArray.push(attack)
  })
  return returnArray
}

function calculateBonus(score){
  return Math.floor((score-10)/2)
}

function getStatBonus(stats,name){
  let score
  stats.forEach(elem => {
    if(elem.name === name) score = elem.score
  })
  return Math.floor((score-10)/2)
}

async function test(id){
  const response = await global.prisma.character_sheet.findMany({
    where: { character_id:id },
    include: {
      character_sheet_actions: {
        select: {
          c_action: {
            include:{
              c_attack:true, c_feature:true, c_spell:true
            }
          }
        },
      }
    }
  })
  try {
    const actions = response[0]
    const actionArray = []
    Object.keys(actions).forEach(elem => {
      if(elem == 'character_sheet_actions'){
        handleActions(actions[elem],actionArray);
      }
    })
    console.log(actionArray);
  } catch (error) {
    
  }
}

function handleActions(actions,actionArray){
  actions.forEach(item => {
    const attacks = item.c_action['c_attack']
    const features = item.c_action['c_feature']
    const spells = item.c_action['c_spell']
    const c_action = item.c_action
    const action = {
      icon:c_action.icon,
      name:c_action.name,
      subtitle:c_action.subtitle,
      range:c_action.range,
      hit_dc:c_action.hit_dc,
      damage:c_action.damage,
      notes:c_action.notes,
      bonus:c_action.bonus
    }

    if(features.length > 0) {
      handleFeatures(features,action)
    }
    if(attacks.length > 0) {
      handleAttack(attacks,action)
    }
    if(spells.length > 0) {
      handleSpells(spells,action)
    }

    actionArray.push(action)

  })
}

function handleAttack(actionArray,attackToHandle){
  actionArray.forEach(elem => {
    attackToHandle.isAttack = true
    attackToHandle.attack_type = elem.attack_type
    attackToHandle.location = elem.location;
    attackToHandle.properties = elem.properties
    attackToHandle.proficient = elem.proficient
  })
}
function handleFeatures(actionArray,FeatureToHandle){
  actionArray.forEach(elem => {
    FeatureToHandle.isFeature = true
    FeatureToHandle.isAttack = elem.isAttack
    FeatureToHandle.damage_type = elem.damage_type
    FeatureToHandle.text = elem.text
    FeatureToHandle.frequency = elem.frequency
    FeatureToHandle.quantity = elem.quantity 
  })
}
function handleSpells(actionArray,SpellToHandle){

}

async function getCharacterSheet(id,res,req){
  const response = await global.prisma.character_sheet.findMany({
    where : {character_id:id},
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
    // console.log(character_sheet);
    handleCharacterActions(character_sheet)
    handleCharacterSpells(character_sheet)
    return character_sheet
  } catch (error) {
    console.log(error);
    res.status(400).json({message:"Couldn't retrieve the character sheet"})
  }
}

function handleCharacterActions(character_sheet){
  const unparsedActions = character_sheet.character_sheet_custom_action;
  // console.log(unparsedActions);
  const actions = {}
  actions.attacks = []
  actions.action = []
  unparsedActions.forEach(item => {
    const action = item.action_custom
    if(action.isAttack) actions.attacks.push(action)
    if(action.isFeature) actions.action.push(action)
  })
  // console.log(actions);
}

function handleCharacterSpells(character_sheet){
  const unparsedSpells = character_sheet.character_sheet_custom_action;
  const spells = {};
  unparsedSpells.forEach(item => {
    const spell = item.action_custom
    // console.log(spell.isSpell);
    if(spell.isSpell){
      const level = getSpellLevel(spell.level);
      const levelExist  = spells[level]
      if(!levelExist){
        spells[level] = {slots:0,used:0,spells:[]}
      }
      spells[level].spells.push(spell)
      console.log({spells:spells[level].spells});
    }
  })
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

module.exports = {
  getCharacter
}
