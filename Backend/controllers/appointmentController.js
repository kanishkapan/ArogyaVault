import { User, Appointment } from "../models/index.js";

export const bookAppointment = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const { doctorId, slotDateTime } = req.body;
    const studentId = req.user.id;
    
    // Check if the doctor has an available slot at the requested time
    const doctor = await User.findOne({
      _id: doctorId,
      "availableSlots.dateTime": slotDateTime,
      "availableSlots.isBooked": false
    });
    
    if (!doctor) {
      return res.status(400).json({ message: "Time slot is not available." });
    }
    
    // Check if the student is booking a valid time slot
    const existingAppointment = await Appointment.findOne({
      doctorId,
      slotDateTime
    });

    if (existingAppointment) {
      return res.status(400).json({ message: "Time slot already booked." });
    }

    // Create the appointment
    const appointment = new Appointment({
      studentId,
      doctorId,
      slotDateTime
    });

    // Update the doctor's available slot to mark it as booked
    await User.findOneAndUpdate(
      { 
        _id: doctorId,
        "availableSlots.dateTime": slotDateTime 
      },
      { 
        $set: { 
          "availableSlots.$.isBooked": true 
        } 
      }
    );

    await appointment.save();

    //Notify the doc in realtime
    const io = req.app.get("socketio"); 
    const onlineUsers = req.app.get("onlineUsers"); // Get the online users Map

    if (onlineUsers.has(doctorId.toString())) {
      const doctorSocket = onlineUsers.get(doctorId.toString());
      console.log(`Sending notification to doctor ${doctorId}`);
      doctorSocket.emit("newAppointment", {
        message: "📅 You have a new appointment request!",
        appointment,
      });
    }
      // } else {
      //   console.log(`Doctor ${doctorId} is offline.`);
      // }
    

    res.status(201).json({ message: "Appointment booked successfully.", appointment });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getStudentAppointments = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { status } = req.query;

    const filter = { studentId };
    if (status) {
      filter.status = status;
    }
    const appointments = await Appointment.find(filter).populate(
      "doctorId",
      "name email specialization"
    );

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//confirms or cancel appointment
export const updateAppointmentStatus = async (req, res) => {
  try {
    console.log("🔹 updateAppointmentStatus function called!"); 
    const { appointmentId } = req.params;
    const { status } = req.body;
    console.log("Appointment ID:", appointmentId);
    console.log("New Status:", status);
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    console.log("✅ Appointment updated successfully!");

    appointment.status = status;
    await appointment.save();
    
    // 🔹 Notify the patient in real-time
    const io = req.app.get("socketio");
    const onlineUsers = req.app.get("onlineUsers"); // ✅ Get the online users Map

    console.log("🔍 Checking appointment update event...");
    console.log("Appointment Object:", appointment);
    console.log("Student ID:", appointment.studentId);

// Check if the student is online
    if (onlineUsers.has(appointment.studentId.toString())) {
    const patientSocket = onlineUsers.get(appointment.studentId.toString());
  
    console.log(`✅ Sending update to patient ${appointment.studentId}`);
    console.log("Patient Socket:", patientSocket?.id);  // Log socket ID to confirm connection
  
    patientSocket.emit("appointmentUpdate", {
      message: `Your appointment has been ${status}`,
      appointment,
  });
  console.log("Socket event emitted to patient:", appointment.studentId);

  } else {
  console.log(`Patient ${appointment.studentId} is offline. Cannot send update.`);
  }

// Send response back
    res.status(200).json({ message: `Appointment ${status} successfully` });

  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
    

