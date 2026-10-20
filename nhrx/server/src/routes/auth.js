const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const { requireAuth } = require('../middleware/auth');

// 1. DOCTOR LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.doctor.findUnique({ where: { email } }); // Mapped with Doctor model
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const doctor = { id: user.id, name: user.name, email: user.email, hospitalId: user.hospitalId };
  const token = jwt.sign(doctor, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, doctor });
});

// 2. GET LOGGED IN DOCTOR INFO
router.get('/me', requireAuth, (req, res) => res.json({ doctor: req.doctor }));

// 3. GET APPOINTMENT FORM DATA (Adjusted Clean Version - No Crashes)
router.get('/patient-appointment-form', async (req, res) => {
  try {
    // Standalone separate tables pull to prevent validation structural mismatches
    const doctors = await prisma.doctor.findMany();
    const specialties = await prisma.specialities.findMany();
    const availabilities = await prisma.doctorTimings.findMany();

    // Mapping arrays together manually so frontend gets the exact same layout structure
    const formData = doctors.map(doc => {
      return {
        ...doc,
        specialty: specialties.find(s => s.id === doc.specialtyId) || null,
        availabilities: availabilities.filter(t => t.doctorId === doc.id)
      };
    });

    res.status(200).json(formData);
  } catch (error) {
    console.error("Prisma Fetch Error Detailed:", error);
    res.status(500).json({ error: "Internal queries alignment issue inside schema configurations." });
  }
});

// 4. DOCTOR REGISTER
router.post('/register-doctor', async (req, res) => {
    const { name, email, password, hospitalId, specialtyId, availabilities } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required!" });
    }

    try {
        const existingUser = await prisma.doctor.findUnique({
            where: { email: email }
        });

        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newDoctor = await prisma.doctor.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
                hospitalId: hospitalId ? parseInt(hospitalId) : null,
                specialtyId: specialtyId ? parseInt(specialtyId) : null,
                availabilities: {
                    create: availabilities || []
                }
            }
        });

        return res.status(201).json({ 
            message: "Doctor registered successfully!", 
            doctor: newDoctor
        });

    } catch (error) {
        console.error("Prisma Error:", error);
        return res.status(500).json({ error: "Database error while registering doctor." });
    }
});

module.exports = router; // Always at the very bottom!
