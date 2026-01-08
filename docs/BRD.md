# Business Requirements Document (BRD)

## Project: Parametric OpenSCAD CAD Generator

---

## 1. Purpose

Provide a web-based interface that allows users to generate parametric CAD files using curated OpenSCAD templates without installing OpenSCAD locally.

---

## 2. Goals

- Make parametric CAD generation accessible to non-technical users
- Support batch generation of STL files
- Enforce strict validation to prevent invalid geometry or execution abuse
- Enable future monetization (credits, subscriptions, commercial licenses)

---

## 3. In Scope (MVP)

- Two model types: vertical and horizontal socket holders
- Parameterized OpenSCAD execution
- STL output only
- ZIP download of generated files
- Self-hosted deployment

---

## 4. Out of Scope (MVP)

- User authentication
- Payments
- In-browser 3D preview
- User-uploaded OpenSCAD code
- STEP/DXF output

---

## 5. Target Users

- Makers / hobbyists
- Etsy sellers
- Small-scale manufacturers
- Users with basic measurement knowledge

---

## 6. Success Criteria

- User can generate STL files without OpenSCAD installed
- Invalid inputs never reach OpenSCAD execution
- Jobs complete reliably under expected load
- Output files are deterministic and reproducible

---

## 7. Assumptions

- OpenSCAD templates are trusted and curated
- Traffic volume is initially low
- System is self-hosted on a Proxmox VM
