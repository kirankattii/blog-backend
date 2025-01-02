import { supportMines } from "../config/fileSystem.js"
import { v4 as uuidv4 } from "uuid"
import fs from "fs"

export const imageValidator = (size, mime) => {
  if (bytesToMb(size) > 2) {
    return "Image Size must be less than 2MB"
  }
  else if (!supportMines.includes(mime)) {
    return "Image type must be png, jpg, jpeg, svg, gif, webp"
  }
  return null
}

export const bytesToMb = (bytes) => {
  return bytes / (1024 * 1024)
}

export const generateRandomNum = () => {
  return uuidv4()
}


export const getImageUrl = (imgName) => {
  return `${process.env.APP_URL}/images/${imgName}`
}

export const removeImage = (imageName) => {
  const path = process.cwd() + '/public/images' + imageName
  if (fs.existsSync(path)) {
    fs.unlinkSync(path)
  }
}


export const uploadImage = (image) => {
  const imgExt = image?.name.split(".")
  const imageName = generateRandomNum() + "." + imgExt[1]
  const uploadPath = process.cwd() + '/public/images/' + imageName

  image.mv(uploadPath, (err) => {
    if (err) throw err
  })

  return imageName
}