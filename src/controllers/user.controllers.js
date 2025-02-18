import { REFRESH_TOKEN_SECRET, COOKIE_OPTIONS } from "../constants.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import {
  registerUserValidation,
  loginUserValidation,
  deleteUserValidation,
  doValidation,
} from "../utils/zod.js";
import User from "../models/user.model.js";
import Todo from "../models/todo.model.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (user) => {
  try {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Internal Server Error", [error.message]);
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = doValidation(
    registerUserValidation,
    req.body
  );

  const isUserExist = await User.findOne({ email }).lean();
  if (isUserExist) throw new ApiError(409, "User already exists");

  const createdUser = await User.create({ name, email, password });

  const userResponse = {
    id: createdUser._id,
    name: createdUser.name,
    email: createdUser.email,
  };

  return new ApiResponse(201, "User created successfully", userResponse).send(
    res
  );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = doValidation(loginUserValidation, req.body);

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(400, "User not found");

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) throw new ApiError(400, "Password is incorrect");

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user
  );

  const responseData = {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };

  res
    .cookie("accessToken", accessToken, {
      ...COOKIE_OPTIONS,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    })
    .cookie("refreshToken", refreshToken, {
      ...COOKIE_OPTIONS,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });

  return new ApiResponse(200, "User logged in successfully", responseData).send(
    res
  );
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?.id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  res
    .clearCookie("accessToken", COOKIE_OPTIONS)
    .clearCookie("refreshToken", COOKIE_OPTIONS);
  return new ApiResponse(200, "User logged out successfully").send(res);
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!refreshToken) throw new ApiError(401, "No refresh token provided");

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded._id);

    if (!user || refreshToken !== user.refreshToken) {
      throw new Error("Invalid refresh token");
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user);

    res.cookie("accessToken", newAccessToken, {
      ...COOKIE_OPTIONS,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });
    res.cookie("refreshToken", newRefreshToken, {
      ...COOKIE_OPTIONS,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });

    return new ApiResponse(200, "Access token refreshed", {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }).send(res);
  } catch (error) {
    res.clearCookie("accessToken").clearCookie("refreshToken");
    throw new ApiError(401, "Invalid refresh token");
  }
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { password } = doValidation(deleteUserValidation, req.body);

  if (!password) {
    throw new ApiError(400, "Password is required for verification");
  }

  const user = await User.findById(req.user?.id).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(400, "Invalid password");
  }

  const deleteResult = await User.deleteOne({ _id: req.user?.id });

  if (!deleteResult || deleteResult.deletedCount === 0) {
    throw new ApiError(500, "User deletion failed");
  }

  await Todo.deleteMany({ owner: req.user?.id });

  res
    .clearCookie("accessToken", COOKIE_OPTIONS)
    .clearCookie("refreshToken", COOKIE_OPTIONS);
  return new ApiResponse(200, "User deleted successfully").send(res);
});
