# NHRX — Doctor Interface

Monolithic full-stack app: **Next.js 14 + Tailwind** (client) · **Express** (server) · **PostgreSQL + Prisma**.

## Setup
```bash
# 1. Server
cd server
cp .env.example .env          # set DATABASE_URL, JWT_SECRET, ENCRYPTION_KEY
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev                   # http://localhost:4000

# 2. Client
cd ../client
npm install
npm run dev                   # http://localhost:3000
```
Generate an encryption key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Seeded doctors (password: `password123`)
| Doctor | Email | Hospital |
|---|---|---|
| Dr. Ayesha Khan | ayesha@hospital1.pk | Hospital 1 |
| Dr. Bilal Ahmed | bilal@hospital1.pk | Hospital 1 |
| Dr. Sara Malik | sara@hospital2.pk | Hospital 2 |
| Dr. Usman Raza | usman@hospital2.pk | Hospital 2 |

Sample patient CNICs: `35202-1234567-1`, `42101-7654321-3`

## Security
`diagnosis` and `treatment` are encrypted with AES-256-GCM (`server/src/utils/crypto.js`) before writing to PostgreSQL and decrypted only inside authenticated (JWT) routes — Decrypt-on-Read.
