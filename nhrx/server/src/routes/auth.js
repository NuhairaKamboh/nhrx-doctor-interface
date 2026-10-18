const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const { requireAuth } = require('../middleware/auth');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const doctor = { id: user.id, doctorName: user.doctorName, email: user.email, hospitalName: user.hospitalName };
  const token = jwt.sign(doctor, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, doctor });
});

router.get('/me', requireAuth, (req, res) => res.json({ doctor: req.doctor }));


// Doctor Register karne ki API (Prisma Version)
router.post('/register-doctor', async (req, res) => {
    const { doctorName, email, password, hospitalName } = req.body;

    if (!doctorName || !email || !password) {
        return res.status(400).json({ error: "doctorName, email, and password are required!" });
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: email }
        });

        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newDoctor = await prisma.user.create({
            data: {
                doctorName: doctorName,
                email: email,
                password: hashedPassword,
                hospitalName: hospitalName || null
            }
        });

        return res.status(201).json({ 
            message: "Doctor registered successfully!", 
            doctor: { id: newDoctor.id, doctorName: newDoctor.doctorName, email: newDoctor.email } 
        });

    } catch (error) {
        console.error("Prisma Error:", error);
        return res.status(500).json({ error: "Database error while registering doctor." });
    }
});

module.exports = router;
