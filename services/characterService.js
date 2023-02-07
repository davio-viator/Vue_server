// const  { PrismaClient } = require('@prisma/client')

const prisma = global.prisma

async function getCharacter(req,res){
  const {character_id} = parseInt(req.params)
  const id = parseInt(req.params['character_id'])
  // const characterDbOld = await prisma.character_sheet.findMany({
  //   where: { character_id:id }
  // })
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
      console.log(getStatBonus(character.stats,'strength'));
      damage = `${element.attack.damage}+${score}`;
    }
    else {
      damage = element.attack.damage
    }
    console.log(damage);
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

module.exports = {
  getCharacter
}
