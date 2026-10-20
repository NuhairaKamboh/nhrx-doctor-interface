const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET: Doctor Dashboard ke liye Sirf Aaj ke Appointments Fetch karne ki API
router.get('/doctor/todays-appointments', async (req, res) => {
  try {
    const doctorId = parseInt(req.query.doctorId);
    
    if (!doctorId) {
      return res.status(400).json({ error: "Doctor ID missing or invalid" });
    }

    // Aaj ki current date calculate karna (Time hours ko 00:00:00 zero out karke)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 🚀 FIXED: 'prisma.appointments' ko badal kar 'prisma.Appointments' (Capital A) kar diya hai
    const todaysAppointments = await prisma.Appointments.findMany({
      where: {
        DoctorID: doctorId,
        AppointmentDate: today // Sirf wahi rows jo aaj ki tareeq ki hain
      },
      include: {
        // Patient ki general info (Naam aur contact) pull karne ke liye
        Patients: {
          select: {
            patientID: true,
            firstName: true,
            lastName: true,
            gender: true,
            phone: true
          }
        }
      },
      orderBy: {
        AppointmentTime: 'asc' // Taake subah ke checkups upar sequence mein aayein
      }
    });

    res.json(todaysAppointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

