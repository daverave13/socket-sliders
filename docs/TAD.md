# Technical Architecture Document (TAD)

## Parametric OpenSCAD CAD Generator

---

## 1. Architecture Overview

The system consists of a frontend web app, an API server, a background worker that executes OpenSCAD, and local storage for artifacts. All components are containerized and deployed via Docker Compose.

---

## 2. Core Components

### Frontend

- React + Vite + TypeScript
- React Router
- Dynamic form rendering from schemas

### API

- Node.js + TypeScript
- Fastify
- Zod for validation
- Job orchestration and status tracking

### Worker

- Node.js + TypeScript
- Runs OpenSCAD CLI
- Generates STL files
- Packages outputs into ZIPs

### Queue

- Redis
- BullMQ for job processing

---

## 3. Execution Model

1. Client submits job request
2. API validates input and enqueues job
3. Worker processes job in isolated container
4. STL files are generated
5. Files are zipped and stored locally
6. Client downloads ZIP via API

---

## 4. Security & Isolation

- Templates mounted read-only
- No user-provided code
- Per-job workspace isolation
- CPU and execution time limits
- Strict schema validation

---

## 5. Storage

- Local filesystem for artifacts
- Artifacts expire after a fixed TTL
- Temporary workspaces cleaned after job completion

---

## 6. Scalability

- Stateless API
- Horizontally scalable workers
- Queue-based backpressure

---

## 7. Deployment

- Proxmox VM
- Docker Compose
- Reverse proxy (Caddy or Nginx Proxy Manager)
