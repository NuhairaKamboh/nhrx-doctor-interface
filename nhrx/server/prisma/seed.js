require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../src/prisma'); // extended client → auto-encrypts

async function main() {
  await prisma.medicalCase.deleteMany();
  await prisma.user.deleteMany();
  const password = await bcrypt.hash('password123', 10);

  const doctors = {};
  for (const d of [
    { doctorName: 'Dr. Ayesha Khan', email: 'ayesha@hospital1.pk', hospitalName: 'Hospital 1' },
    { doctorName: 'Dr. Bilal Ahmed', email: 'bilal@hospital1.pk', hospitalName: 'Hospital 1' },
    { doctorName: 'Dr. Sara Malik', email: 'sara@hospital2.pk', hospitalName: 'Hospital 2' },
    { doctorName: 'Dr. Usman Raza', email: 'usman@hospital2.pk', hospitalName: 'Hospital 2' },
  ]) {
    doctors[d.email] = await prisma.user.create({ data: { ...d, password } });
  }

  const cases = [
    { cnic: '35202-1234567-1', doc: 'ayesha@hospital1.pk', diagnosis: 'Type 2 Diabetes Mellitus', treatment: 'Lifestyle modification, HbA1c monitoring every 3 months', medicines: 'Metformin 500mg BD', status: 'COMPLETED', date: '2026-03-12' },
    { cnic: '35202-1234567-1', doc: 'sara@hospital2.pk', diagnosis: 'Hypertension Stage 1', treatment: 'Low-sodium diet, BP log', medicines: 'Amlodipine 5mg OD', status: 'COMPLETED', date: '2026-06-02' },
    { cnic: '35202-1234567-1', doc: 'usman@hospital2.pk', diagnosis: 'Follow-up: diabetic retinopathy screening', treatment: 'Referred to ophthalmology', medicines: '—', status: 'PENDING', date: '2026-09-20' },
    { cnic: '42101-7654321-3', doc: 'bilal@hospital1.pk', diagnosis: 'Acute bronchitis', treatment: 'Rest, fluids, steam inhalation', medicines: 'Azithromycin 500mg x3 days', status: 'COMPLETED', date: '2026-08-15' },
  ];
  for (const c of cases) {
    const doc = doctors[c.doc];
    await prisma.medicalCase.create({
      data: {
        patientCnic: c.cnic, diagnosis: c.diagnosis, treatment: c.treatment, medicines: c.medicines,
        caseStatus: c.status, checkupDate: new Date(c.date), hospitalName: doc.hospitalName, doctorId: doc.id,
      },
    });
  }
  console.log('Seeded 4 doctors and', cases.length, 'encrypted medical cases');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => process.exit(0));
