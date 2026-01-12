# CampusOne Store
Github: https://github.com/rusec-ctf
Author: Mohamad Khawam
Github_Username: mkhawam
Difficulty: Hard

**REQUIRES DEPLOYABLE CONTENT**

Participant files:
* N/A

Hints:
* Modern web apps love storing config in interesting places... [FREE]
* What does the browser console know that you don't? [10 points]
* Admins tend to leave debug tools lying around [25 points]
* The flag moved. Can you make the database talk? [50 points]

Flag: `RUSEC{S3ss10n_H1j4ck1ng_1s_Fun_2938}`

## Description

Welcome to **CampusOne** - your one-stop shop for all your college tech needs!

We just launched our new e-commerce platform for Rutgers students. Our developers assure us it's completely secure, but we've been getting some strange reports about unauthorized admin access...

Can you find a way to access the admin panel and uncover what's hidden there?

**Challenge URL:** `https://campus-one.ctf.rusec.club`

---

## Deployment Notes (For CTF Admins)

### Docker Build
```bash
docker build -t campus-one-store:latest .
```

### Kubernetes Deployment
```bash
# Create TLS secret with Let's Encrypt certs first
kubectl create secret tls tls-secret \
  --cert=/path/to/fullchain.pem \
  --key=/path/to/privkey.pem

# Deploy the application
kubectl apply -f k8s.yaml
```

### Environment
- **Port**: 443 (HTTPS via Nginx sidecar)
- **Database**: SQLite (embedded, auto-seeds on first run)
- **Framework**: Next.js 16

### Default Test Account
- Email: `student@rutgers.edu`
- Password: `password123`
