import { Router } from "express";
import { UsersController } from "../controllers/UsersController.js";
import { authMiddleware } from "../middlewares/Auth.js";
import { getCurrentUser } from "../controllers/GetCurrentUser.js";

const usersRoutes = Router()

usersRoutes.post(
    "/check-email",
    new UsersController().checkEmail
)

usersRoutes.post(
    "/",
    new UsersController().create
)

usersRoutes.post(
    "/login",
    new UsersController().login
)

usersRoutes.put(
    "/update-username",
    authMiddleware,
    new UsersController().updateUsername
)

usersRoutes.get(
    '/me',
    authMiddleware,
    getCurrentUser
)

usersRoutes.get(
    "/",
    authMiddleware,
    new UsersController().profile
)

export default usersRoutes