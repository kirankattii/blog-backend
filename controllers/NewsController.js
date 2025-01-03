import vine, { errors } from "@vinejs/vine";
import { newsSchema } from "../validations/newsValidation.js";
import { generateRandomNum, imageValidator, removeImage, uploadImage } from "../utils/helper.js";
import prisma from "../DB/db_config.js";
import NewsApiTranasform from "../transform/newsApiTransform.js";

class NewsController {
  static async index(req, res) {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20

    if (page <= 0) {
      page = 1
    }
    if (limit <= 0 || limit > 100) {
      limit = 10
    }

    const skip = (page - 1) * limit

    const news = await prisma.news.findMany({
      take: limit,
      skip: skip,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile: true
          }
        }
      }
    })
    const newsTransform = news?.map((item) => NewsApiTranasform.transform(item))
    const totalNews = await prisma.news.count()
    const totalPage = Math.ceil(totalNews / limit)
    return res.json({
      success: true, news: newsTransform, metaData: {
        totalPage,
        cuerrentPage: page,
        currentLimit: limit
      }
    })
  }


  static async show(req, res) {
    try {
      const { id } = req.params
      const news = await prisma.news.findUnique({
        where: {
          id: Number(id)
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profile: true
            }
          }
        }
      })

      const transformNews = news ? NewsApiTranasform.transform(news) : null


      return res.json({ status: 200, news: transformNews })

    } catch (error) {
      console.log("error is ", error);

      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ error: error.messages })
      } else {
        return res.status(500).json({ status: 500, message: "Somehing went wrong" })
      }

    }
  }

  static async store(req, res) {
    try {
      const user = req.user
      const body = req.body;
      const validator = vine.compile(newsSchema)
      const payload = await validator.validate(body)

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ errors: { image: "No files were uploaded." } });
      }


      const image = req.files.image

      const message = imageValidator(image.size, image.mimetype)

      if (message !== null) {
        return res.status(400).json({
          errors: { image: message }
        })
      }
      // image upload
      const imageName = uploadImage(image)

      payload.image = imageName
      payload.user_id = user.id

      const news = await prisma.news.create({
        data: payload
      })

      return res.json({ status: 200, success: true, message: "News created successfully", news })
    } catch (error) {
      console.log("error is ", error);

      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ error: error.messages })
      } else {
        return res.status(500).json({ status: 500, message: "Somehing went wrong" })
      }
    }

  }


  static async update(req, res) {
    try {
      const { id } = req.params
      const user = req.user
      const body = req.body
      const news = await prisma.news.findUnique({
        where: {
          id: Number(id)
        }
      })
      if (user.id !== news.user_id) {
        return res.status(403).json({ status: 403, message: "You are not authorized to update this news" })
      }

      const validator = vine.compile(newsSchema)
      const payload = await validator.validate(body)


      const image = req?.file?.image

      if (image) {
        const message = imageValidator(image?.size, image?.mimetype)
        if (message !== null) {
          return res.status(400).json({
            errors: {
              image: message
            }
          })
        }



        // uploda a new image
        const imageName = uploadImage(image)
        payload.image = imageName




        // delete old image
        removeImage(news.image)
      }

      await prisma.news.update({
        data: payload,

        where: {
          id: Number(id)
        }
      })

      return res.status(200).json({ status: 200, message: "News updated successfully" })

    } catch (error) {
      console.log("error is ", error);

      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ error: error.messages })
      } else {
        return res.status(500).json({ status: 500, message: "Somehing went wrong" })
      }
    }
  }

  static async destroy(req, res) {
    try {
      const { id } = req.params
      const user = req.user
      const news = await prisma.news.findUnique({
        where: {
          id: Number(id)
        }
      })
      if (user.id !== news?.user_id) {
        return res.status(403).json({ status: 403, message: "You are not authorized to delete this news" })
      }

      // delete image from filesyatem
      removeImage(news.image)

      await prisma.news.delete({
        where: {
          id: Number(id)
        }
      })

      return res.json({ success: true, message: "News deleted successfully!" });

    } catch (error) {
      console.log("error is ", error);

      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ error: error.messages })
      } else {
        return res.status(500).json({ status: 500, message: "Somehing went wrong" })
      }
    }


  }

  static async getUserNews(req, res) {
    try {
      const user = req.user; // Assuming you have middleware for authentication

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "You need to be logged in to view your news.",
        });
      }

      const userNews = await prisma.news.findMany({
        where: {
          user_id: user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profile: true,
            },
          },
        },
      });

      const newsTransform = userNews?.map((item) =>
        NewsApiTranasform.transform(item)
      );

      return res.json({
        success: true,
        news: newsTransform,
      });
    } catch (error) {
      console.error("Error fetching user news:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch user news.",
      });
    }
  }

}

export default NewsController