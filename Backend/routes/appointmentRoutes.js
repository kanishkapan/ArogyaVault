import express from "express";
import {
  bookAppointment,
  updateAppointmentStatus,
  getStudentAppointments
} from "../controllers/appointmentController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
// import { io } from "../socket.js"; 

export const router = express.Router();

router.post("/", authMiddleware(["student"]), bookAppointment);
router.get("/student", authMiddleware(["student"]), getStudentAppointments);

// 🔹 Doctor updates appointment status (confirm/cancel)
router.put("/:id/status", authMiddleware(["doctor"]),updateAppointmentStatus);


export default router;
