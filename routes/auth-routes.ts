import { Router } from "express";
import controller from "../controllers/auth-controller.js";
import { body } from "express-validator";

const router = Router();

router.post(
  "/signup",
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 8, max: 32 })
    .withMessage("Password must be more than 8 and less than 32 characters"),
  controller.signup
);
router.post("/login", controller.login);
router.post("/verifyCode", controller.verifyCode);
router.get("/refresh", controller.refresh);
router.delete("/logout", controller.logout);

export default router;
