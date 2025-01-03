import { errors } from "@vinejs/vine"
import { generateRandomNum, imageValidator } from "../utils/helper.js"
import prisma from "../DB/db_config.js"

class ProfileController {
  static async index(req, res) {

    try {
      const profile = await prisma.users.findUnique({
        where: {
          id: req.user.id
        }
      })

      const user = req.user
      return res.json({ success: true, user, profile: profile.profile })
    } catch (error) {
      return res.json({ success: false, message: "Something went wrong" })
    }
  }


  static async update(req, res) {
    try {
      const { id } = req.params

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ status: 400, message: "No files were uploaded." });
      }

      const profile = req.files.profile
      console.log(profile);


      const message = imageValidator(profile.size, profile.mimetype)

      if (message !== null) {
        return res.status(400).json({
          errors: { profile: message }
        })
      }

      const imgExt = profile?.name.split(".")
      const imageName = generateRandomNum() + "." + imgExt[1]

      const uploadPath = process.cwd() + '/public/images/' + imageName
      profile.mv(uploadPath, (err) => {
        if (err) throw err
      })

      await prisma.users.update({
        data: {
          profile: imageName
        },
        where: {
          id: Number(id),
        }
      })

      return res.json({
        status: 200,
        message: "Profile updated successfully"
      })

    } catch (error) {

      console.log("The error is", error);


    }
  }



  static async destroy() {

  }

}


export default ProfileController