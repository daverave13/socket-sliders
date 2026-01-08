---

# 📄 `docs/claude-tasks.md`

```md
# Claude Code – Task Context

You are working on a project that generates parametric STL files using OpenSCAD.

---

## Source of Truth

Before making changes:

- Read `docs/BRD.md`
- Read `docs/TAD.md`
- Read `docs/requirements-sockets.md`
- Read shared Zod schemas in `/packages/shared`

Do not change requirements without explicitly calling it out.

---

## Core Tasks

- Implement Zod schemas for socket job requests
- Ensure strict validation for:
  - metric vs imperial nominal exclusivity
  - two-digit limits
  - orientation-specific geometry
- Generate OpenSCAD wrapper `.scad` files from normalized inputs
- Run OpenSCAD in an isolated worker
- Package STL outputs into deterministic ZIP files

---

## Constraints

- STL output only
- No user-provided OpenSCAD code
- All geometry calculations use metric internally
- Must be self-hostable on Proxmox

---

## Expectations

- Prefer clarity over cleverness
- Favor explicit schemas over inferred behavior
- Add tests for all validation logic
- Call out edge cases and assumptions

---

## Non-Goals (MVP)

- Payments
- Authentication
- In-browser previews
- STEP/DXF generation
