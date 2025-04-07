import express from "express";
import { getUserNotifications,markAllNotificationsAsRead } from "../controllers/notificationController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/",authMiddleware(["student","doctor","admin"]), getUserNotifications);
router.patch("/mark-all-read/:id", markAllNotificationsAsRead);

export default router;
