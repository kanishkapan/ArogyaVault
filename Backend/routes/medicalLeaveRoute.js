import express from "express";
import { applyMedicalLeave, getLeaveStatus } from "../controllers/medicalLeaveController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/apply", authMiddleware(["student"]), applyMedicalLeave);
router.get("/status", authMiddleware(["student"]), getLeaveStatus);

export default router;
