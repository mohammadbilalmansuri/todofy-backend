import { z } from "zod";
import ApiError from "./ApiError.js";

const nameValidation = z
  .string()
  .min(3, "Name must be at least 3 characters long.")
  .max(30, "Name must not exceed 30 characters.");

const emailValidation = z.string().email("Please enter a valid email address.");

const passwordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .max(24, "Password must not exceed 24 characters.")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_]).*$/,
    "Password must include at least one lowercase letter, one uppercase letter, one number, and one special character."
  );

const todoTextValidation = z
  .string()
  .min(1, "Text is required and cannot be empty.")
  .max(300, "Text must not exceed 300 characters.");

const dueTimeValidation = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
    "Due time must be in the format YYYY-MM-DDTHH:MM."
  );

export const registerUserValidation = z.object({
  name: nameValidation,
  email: emailValidation,
  password: passwordValidation,
});

export const loginUserValidation = z.object({
  email: emailValidation,
  password: passwordValidation,
});

export const deleteUserValidation = z.object({
  password: passwordValidation,
});

export const todoValidation = z.object({
  text: todoTextValidation,
  dueTime: dueTimeValidation,
});

export const todoStatusValidation = z.object({
  status: z.boolean(),
});

export const doValidation = (validator, data) => {
  const result = validator.safeParse(data);

  if (!result.success) {
    throw new ApiError(
      422,
      result.error.errors.map((e) => e.message).join(", "),
      result.error.errors.map((e) => e.message)
    );
  }

  return result.data;
};
