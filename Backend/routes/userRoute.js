import express from "express";
import { signup, login, logout, getAllDoctors } from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/doctors", getAllDoctors)
export default router;
