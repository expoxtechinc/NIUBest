# Security Specification for Nova International University (NIU)

## 1. Data Invariants
- Admin verification MUST verify `exists(/databases/$(database)/documents/admins/$(request.auth.uid))` OR verified admin email `aki.sokpah.link@gmail.com`.
- Students MUST NEVER modify roles or create admin records.
- Students can only read published programmes, their own enrollments, their own studentProgress, their own certificates, and their own transcripts.
- Verification records (`/verificationRecords/{id}`) are publicly readable for certificate validation.
- All IDs must pass `isValidId` check.

## 2. Dirty Dozen Payloads
1. Student attempts to write role: 'admin' to `/users/{uid}`.
2. Unauthenticated user attempts to read `/users/{uid}`.
3. Student attempts to create an unverified certificate `/certificates/{id}`.
4. Student attempts to write an approved status to a draft programme.
5. Anonymous user attempts to write to `/programmes/{id}`.
6. Student attempts to read another student's progress `/studentProgress/{id}`.
7. Student attempts to modify transcript records.
8. Injection attack with 2MB junk string in `programmeId`.
9. Student attempts to delete course from catalogue.
10. Unverified email user claiming admin privileges.
11. Student attempting to update final score in `studentProgress`.
12. Public user attempting to write to `/auditLogs/{id}`.
