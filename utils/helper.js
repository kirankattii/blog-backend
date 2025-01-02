import { supportMines } from "../config/fileSystem.js"
import { v4 as uuidv4 } from "uuid"
import fs from "fs"


import jwt from 'jsonwebtoken'
export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  })

  res.cookie('jwt', token, {
    httpOnly: true, // cookie only accessible by server
    secure: process.env.NODE_ENV !== 'development', // cookie only works in https
    sameSite: 'strict', // CSRF attacks cross-site request forgery attack
    maxAge: 7 * 24 * 60 * 60 * 1000
  })
}




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