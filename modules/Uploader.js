const isUrl = (str) => {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

async function uploadImage(req,res){
  let src;
  if(isUrl(req.body.icon)) src = req.body.icon
  else{ 
    try {
      const image = req.files.imgFile;
      const uploadPath = `${__dirname}/../../Dnd_Website_Vue/public/assets/images/${image.name}`;
      src = `./assets/images/${image.name}`;
    image.mv(uploadPath,(err) => {
      if(err) return err
      })
    } catch (error) {
      return null
    }

  }
  return src;
}

module.exports = {
  uploadImage
}