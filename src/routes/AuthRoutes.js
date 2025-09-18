import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { googleAuth } from "../controllers/AuthGoogleController.js";

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post(
    "/google", 
    googleAuth
);

authRoutes.post(
    "/send-verification-code", 
    (req, res) => authController.sendVerificationCode(req, res)
);

authRoutes.post(
    "/validate-verification-code", authController.validateVerificationCode
);

authRoutes.post(
    "/send-password-reset-code", 
    (req, res) => authController.sendPasswordResetCode(req, res)
);

authRoutes.post(
    "/validate-password-reset-code", 
    authController.validatePasswordResetCode
);

authRoutes.put(
    "/reset-password", 
    authController.resetPassword
);

export default authRoutes;