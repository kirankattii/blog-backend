import vine from "@vinejs/vine";
import { CustomErrorReporter } from "./CustomErrorReportor.js";

vine.errorReporter = () => new CustomErrorReporter();

export const newsSchema = vine.object({
  title: vine.string().minLength(3).maxLength(180),
  content: vine.string().minLength(10).maxLength(50000),
})