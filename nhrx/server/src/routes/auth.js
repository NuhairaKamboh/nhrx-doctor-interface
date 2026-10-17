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

module.exports = router;
