# Security Operations

## Required Production Environment Variables

- `NEXTAUTH_SECRET`: long random secret for Auth.js JWT/session signing.
- `NEXTAUTH_URL`: production HTTPS URL.
- `DATABASE_URL`: PostgreSQL connection used by Prisma.
- `DATA_ENCRYPTION_KEY`: long random secret for local encrypted data stores.
- `BACKUP_ENCRYPTION_KEY`: long random secret for encrypted backup files.
- `ADMIN_EMAIL`: development fallback admin email.
- `ADMIN_PASSWORD_HASH`: bcrypt hash for the development fallback admin password.
- `ADMIN_TOTP_SECRET`: optional base32 TOTP secret for administrator 2FA.

## Authentication And Authorization

- Auth.js/NextAuth credentials provider is used for admin login.
- Passwords are verified with bcrypt-compatible hashes.
- Sessions use Auth.js JWT sessions with role data.
- Admin routes are protected in middleware.
- Server APIs perform RBAC checks before returning patient or CMS data.

## Roles

- `SUPER_ADMIN`
- `HOSPITAL_ADMIN`
- `DOCTOR`
- `RECEPTIONIST`
- `PATIENT`
- `CONTENT_MANAGER`

## Backups

Run encrypted local backups with:

```bash
npm run backup:data
```

Schedule this command using Windows Task Scheduler, cron, or the hosting provider's scheduler. Store backup files outside the app server when deployed.

## Database

The Prisma schema contains security-ready models for users, login history, audit logs, private file assets, digital agreements, and agreement versions. Run migrations against PostgreSQL before production deployment:

```bash
npx prisma migrate dev
npx prisma generate
```

## Production Checklist

- Serve HTTPS only.
- Set all secrets with strong random values.
- Run `npm run security:audit` regularly.
- Review `data/audit-log.json` or connect audit logs to production monitoring.
- Configure centralized error monitoring and production logging.
- Schedule encrypted backups.
- Keep dependencies updated.
