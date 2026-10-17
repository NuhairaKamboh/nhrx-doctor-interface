const { PrismaClient } = require('@prisma/client');
const { encryptCase } = require('./utils/crypto');

const base = new PrismaClient();

// Automatically encrypt sensitive fields on every write to MedicalCase
const prisma = base.$extends({
  query: {
    medicalCase: {
      async create({ args, query }) { args.data = encryptCase(args.data); return query(args); },
      async update({ args, query }) { args.data = encryptCase(args.data); return query(args); },
      async createMany({ args, query }) {
        args.data = Array.isArray(args.data) ? args.data.map(encryptCase) : encryptCase(args.data);
        return query(args);
      },
    },
  },
});

module.exports = prisma;
