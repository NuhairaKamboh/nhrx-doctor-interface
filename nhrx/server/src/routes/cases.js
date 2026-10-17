const router = require('express').Router();
const prisma = require('../prisma');
const { requireAuth } = require('../middleware/auth');
const { decryptCase } = require('../utils/crypto');

const STATUSES = ['PENDING', 'COMPLETED'];
const doctorSelect = { select: { doctorName: true, hospitalName: true } };

router.use(requireAuth);

// GET /api/cases/:cnic — full cross-hospital timeline (decrypt-on-read)
router.get('/:cnic', async (req, res) => {
  const rows = await prisma.medicalCase.findMany({
    where: { patientCnic: req.params.cnic.trim() },
    include: { doctor: doctorSelect },
    orderBy: { checkupDate: 'desc' },
  });
  res.json(rows.map(decryptCase));
});

// POST /api/cases — log a new case at the doctor's hospital
router.post('/', async (req, res) => {
  const { patientCnic, diagnosis, treatment, medicines, caseStatus = 'PENDING', checkupDate } = req.body;
  if (!patientCnic || !diagnosis || !treatment) {
    return res.status(400).json({ error: 'patientCnic, diagnosis and treatment are required' });
  }
  const created = await prisma.medicalCase.create({
    data: {
      patientCnic: patientCnic.trim(),
      diagnosis, treatment,
      medicines: medicines || '',
      caseStatus: STATUSES.includes(caseStatus) ? caseStatus : 'PENDING',
      checkupDate: checkupDate ? new Date(checkupDate) : new Date(),
      hospitalName: req.doctor.hospitalName,
      doctorId: req.doctor.id,
    },
    include: { doctor: doctorSelect },
  });
  res.status(201).json(decryptCase(created));
});

// PATCH /api/cases/:id/status — PENDING <-> COMPLETED (owner doctor only)
router.patch('/:id/status', async (req, res) => {
  const { caseStatus } = req.body;
  if (!STATUSES.includes(caseStatus)) return res.status(400).json({ error: 'Invalid status' });
  const existing = await prisma.medicalCase.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Case not found' });
  if (existing.doctorId !== req.doctor.id) return res.status(403).json({ error: 'Only the treating doctor can update status' });
  const updated = await prisma.medicalCase.update({
    where: { id: req.params.id },
    data: { caseStatus },
    include: { doctor: doctorSelect },
  });
  res.json(decryptCase(updated));
});

module.exports = router;
