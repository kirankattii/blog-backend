import prisma from "../DB/db_config.js";
import vine, { errors } from "@vinejs/vine";
import { loginSchema, registerSchema } from "../validations/authValidation.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

class AuthController {
  static async register(req, res) {
    try {

      const body = req.body
      const validator = vine.compile(registerSchema);


      const payload = await validator.validate(body);

      // check if email exist

      const findUser = await prisma.users.findUnique({
        where: {
          email: payload.email
        }
      })
      if (findUser) {
        return res.status(400).json({
          errors: {
            email: "Email already exist"
          }
        })
      }

      // encrypt password
      const salt = bcrypt.genSaltSync(10)
      payload.password = bcrypt.hashSync(payload.password, salt)

      const user = await prisma.users.create({
        data: payload
      })

      return res.json({ status: 200, message: "User created successfully", user })

    } catch (error) {
      console.log("error is ", error);

      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ error: error.messages })
      } else {
        return res.status(500).json({ status: 500, message: "Somehing went wrong" })
      }
    }

  }

  static async login(req, res) {
    try {
      const body = req.body
      const validator = vine.compile(loginSchema)
      const payload = await validator.validate(body)

      const findUser = await prisma.users.findUnique({
        where: {
          email: payload.email
        }
      })
      if (findUser) {
        if (!bcrypt.compareSync(payload.password, findUser.password)) {
          return res.status(400).json({
            errors: {
              email: "Invalid Credentials"
            }
          })
        }

        const payloadData = {
          id: findUser.id,
          name: findUser.name,
          email: findUser.email,
          profile: findUser.profile,
        }
        // Issue token to user
        const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
          expiresIn: "365d",
        })


        return res.json({ status: 200, message: "User logged in successfully", access_token: `Bearer ${token}` })

      }

      return res.status(400).json({
        errors: {
          email: "User not found"
        }
      })
    } catch (error) {
      console.log("error is ", error);

      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ error: error.messages })
      } else {
        return res.status(500).json({ status: 500, message: "Somehing went wrong" })
      }
    }

  }

}

export default AuthController