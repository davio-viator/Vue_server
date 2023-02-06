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
    character.proficiencies.armors = character.proficiencies.armors.split(',') 
    character.proficiencies.weapons = character.proficiencies.weapons.split(',') 
    character.proficiencies.tools = character.proficiencies.tools.split(',') 
    character.proficiencies.languages = character.proficiencies.languages.split(',') 
    delete character.maxhp
    delete character.currenthp
    delete character.temphp
    delete character.character_classes
    delete character.saving_throws
    console.log(character);
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

module.exports = {
  getCharacter
}
