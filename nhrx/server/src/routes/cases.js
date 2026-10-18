const express = require('express');
const router = express.Router();
const prisma = require('../prisma'); // Prisma client
const { requireAuth } = require('../middleware/auth'); // Security middleware

// ==========================================
// 1. DOCTOR DASHBOARD: INCOMING REQUESTS LOGIC
// ==========================================

// API: Login huay doctor ki saari 'pending' patient requests lane ke liye
router.get('/pending-requests', requireAuth, async (req, res) => {
    const doctorId = req.doctor.id; 

    try {
        const requests = await prisma.case.findMany({
            where: {
                doctorId: doctorId,
                caseStatus: 'PENDING' // Aapke schema ke toggle status ke mutabiq
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return res.json(requests);
    } catch (error) {
        console.error("Prisma Error:", error);
        return res.status(500).json({ error: "Database error while fetching requests." });
    }
});

// API: Request accept ya reject karne par status update karne ke liye
router.put('/update-status/:caseId', requireAuth, async (req, res) => {
    const { caseId } = req.params;
    const { status } = req.body; // 'accepted' ya 'rejected'

    if (!status || !['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status! Use 'accepted' or 'rejected'." });
    }

    try {
        // Status ko PENDING se badal kar COMPLETED ya change karne ke liye
        const targetStatus = status === 'accepted' ? 'COMPLETED' : 'REJECTED';
        const updatedCase = await prisma.case.update({
            where: { id: parseInt(caseId) },
            data: { caseStatus: targetStatus }
        });
        return res.json({ message: `Status updated successfully!`, updatedCase });
    } catch (error) {
        console.error("Error updating status:", error);
        return res.status(500).json({ error: "Database error during status update." });
    }
});


// ==========================================
// 2. PATIENT PROFILE: TIMELINE & HISTORY LOGIC
// ==========================================

// API: Patient ke CNIC ke mutabiq uski saari history lane ke liye (Matches: getCases)
router.get('/:cnic', requireAuth, async (req, res) => {
    const { cnic } = req.params;

    try {
        const cases = await prisma.case.findMany({
            where: {
                patientCnic: decodeURIComponent(cnic)
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return res.json(cases);
    } catch (error) {
        console.error("Prisma Error:", error);
        return res.status(500).json({ error: "Database error while fetching cases." });
    }
});

// API: Naya checkup record create karne ke liye (Matches: createCase)
router.post('/', requireAuth, async (req, res) => {
    const { patientCnic, description, hospitalName } = req.body;
    const doctorId = req.doctor.id; 

    if (!patientCnic) {
        return res.status(400).json({ error: "Patient CNIC is required!" });
    }

    try {
        const newCase = await prisma.case.create({
            data: {
                patientCnic,
                description,
                hospitalName,
                doctorId,
                caseStatus: 'PENDING' 
            }
        });
        return res.status(201).json(newCase);
    } catch (error) {
        console.error("Prisma Error:", error);
        return res.status(500).json({ error: "Database error while creating case." });
    }
});

// API: Status toggle karne ke liye PATCH method (Matches: updateStatus)
router.patch('/:id/status', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { caseStatus } = req.body; 

    try {
        const updatedCase = await prisma.case.update({
            where: { id: parseInt(id) },
            data: { caseStatus: caseStatus }
        });
        return res.json(updatedCase);
    } catch (error) {
        console.error("Prisma Error:", error);
        return res.status(500).json({ error: "Database error during status update." });
    }
});

module.exports = router;
