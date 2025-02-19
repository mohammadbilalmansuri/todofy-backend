import { ACCESS_TOKEN_SECRET } from "../constants.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

const verifyAccess = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next(new ApiError(401, "Unauthorized request! No token provided"));
    }

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = { id: decoded._id, email: decoded.email };
    next();
  } catch (err) {
    return next(new ApiError(401, "Unauthorized request! Token is invalid"));
  }
};

export default verifyAccess;
