import { MedicalLeave } from "../models/medicalLeaveModel.js";

// Apply for Medical Leave
export const applyMedicalLeave = async (req, res) => {
  console.log("Applying for medical leave...");
    console.log("Request Body:", req.body); 
  try {
    const { fromDate, toDate, reason, healthRecordId, supportingDocuments } = req.body;

    const leaveRequest = await MedicalLeave.create({
      studentId: req.user.id,
      healthRecordId,
      fromDate,
      toDate,
      reason,
      supportingDocuments,
      status: "pending",
    });

    res.status(201).json({ message: "Medical leave applied", leaveRequest });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Get Leave Status for Student
export const getLeaveStatus = async (req, res) => {
  try {
    const leaveRequests = await MedicalLeave.find({ studentId: req.user.id }).populate("healthRecordId");
    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
