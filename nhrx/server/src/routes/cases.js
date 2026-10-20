/*const express = require('express');
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

module.exports = router;*/


const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// 1. GET PATIENT HISTORY BY HOSPITAL FILTER
router.get('/:cnic', async (req, res) => {
    const { cnic } = req.params;
    const { hospitalID } = req.query; // Frontend dropdown se aane wali ID

    try {
        const patient = await prisma.patients.findUnique({
            where: { nationalID: decodeURIComponent(cnic) }
        });

        if (!patient) return res.json([]);

        // Filter queries based on selected hospital dynamic configuration
        const history = await prisma.medicalRecords.findMany({
            where: { 
                patientID: patient.patientID,
                hospitalID: hospitalID ? parseInt(hospitalID) : undefined // Agar selection ho to filter karein
            },
            include: {
                RecordDiagnosis: true,
                RecordMedicines: true
            },
            orderBy: { recordDATE: 'desc' }
        });

        const formattedHistory = history.map(item => ({
            id: item.recordID,
            checkupDate: item.recordDATE || new Date(),
            hospitalName: item.hospitalID === 2 ? "Hospital 2" : "Hospital 1",
            caseStatus: "COMPLETED",
            chiefComplaint: item.cheif_complaint || "General Checkup",
            diagnoses: item.RecordDiagnosis.map(d => d.Diagnosis).join(', ') || 'No Diagnosis',
            medicines: item.RecordMedicines.map(m => m.dosage).join(', ') || 'No Medicines'
        }));

        return res.json(formattedHistory);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Fetch error" });
    }
});

// 2. CREATE MEDICAL RECORD WITH SPECIFIC HOSPITAL ID
router.post('/', async (req, res) => {
    const { patientCnic, description, hospitalID } = req.body;
    const currentHospitalID = hospitalID ? parseInt(hospitalID) : 1; 

    if (!patientCnic) return res.status(400).json({ error: "CNIC required!" });

    try {
        let patient = await prisma.patients.findUnique({
            where: { nationalID: patientCnic }
        });

        if (!patient) {
            patient = await prisma.patients.create({
                data: {
                    nationalID: patientCnic,
                    firstName: "Patient",
                    lastName: "Auto-Registered"
                }
            });
        }

        const newRecord = await prisma.medicalRecords.create({
            data: {
                patientID: patient.patientID,
                doctorID: 1,
                hospitalID: currentHospitalID, // Saves 1 or 2 seamlessly based on dropdown toggle
                recordDATE: new Date(),
                cheif_complaint: description || "General Checkup",
                recordType: "OPD"
            }
        });

        return res.status(201).json(newRecord);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Saving failed" });
    }
});

module.exports = router;



