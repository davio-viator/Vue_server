const  { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient();

module.exports = {

  getCharacter : async (id) => await prisma.character_sheet.findMany({
    where: {
      character_icon: id
    }
  })

}
