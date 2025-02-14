import { Router } from "express";
import verifyAccess from "../middlewares/auth.middleware.js";

import {
  registerUser,
  loginUser,
  logoutUser,
  deleteUser,
  refreshAccessToken,
} from "../controllers/user.controllers.js";

const userRoutes = Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/login", loginUser);
userRoutes.post("/logout", verifyAccess, logoutUser);
userRoutes.delete("/delete", verifyAccess, deleteUser);
userRoutes.patch("/refresh-access-token", refreshAccessToken);

export default userRoutes;
