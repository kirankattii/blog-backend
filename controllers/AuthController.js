import prisma from "../DB/db_config.js";
import vine, { errors } from "@vinejs/vine";
import { loginSchema, registerSchema } from "../validations/authValidation.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { generateToken } from "../utils/helper.js";

class AuthController {
  static async register(req, res) {
    try {
      const body = req.body;
      const validator = vine.compile(registerSchema);
      const payload = await validator.validate(body);

      // Check if email already exists
      const findUser = await prisma.users.findUnique({
        where: { email: payload.email },
      });

      if (findUser) {
        return res.status(400).json({
          success: false,
          errors: { email: "Email already exists" },
        });
      }

      // Encrypt password
      const salt = bcrypt.genSaltSync(10);
      payload.password = bcrypt.hashSync(payload.password, salt);

      // Create user
      const user = await prisma.users.create({
        data: payload,
      });

      return res.json({
        success: true,
        message: "User created successfully",
        user,
      });
    } catch (error) {
      console.error("Error in register:", error);

      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({
          success: false,
          errors: error.messages,
        });
      }

      return res.status(500).json({
        success: false,
        message: "An internal server error occurred.",
      });
    }
  }


  static async login(req, res) {
    try {
      const body = req.body;
      const validator = vine.compile(loginSchema);
      const payload = await validator.validate(body);

      // Check if user exists
      const findUser = await prisma.users.findUnique({
        where: { email: payload.email },
      });

      if (!findUser) {
        return res.status(404).json({
          success: false,
          errors: { email: "User not found" },
        });
      }

      // Validate password
      const isPasswordValid = bcrypt.compareSync(payload.password, findUser.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          errors: { password: "Invalid password" },
        });
      }

      // Generate token
      const payloadData = {
        id: findUser.id,
        name: findUser.name,
        email: findUser.email,
        // profile: findUser.profile
        // profile: findUser.profile
      };
      const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
        expiresIn: "365d",
      });

      return res.json({
        success: true,
        message: "User logged in successfully",
        access_token: `Bearer ${token}`,
      });
    } catch (error) {
      console.error("Error in login:", error);

      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({
          success: false,
          errors: error.messages,
        });
      }

      return res.status(500).json({
        success: false,
        message: "An internal server error occurred.",
      });
    }
  }




}









export default AuthController