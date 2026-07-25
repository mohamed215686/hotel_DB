<div align="center">

# 🏨 Hotel DB — Full-Stack Hotel Management System

### Spring Boot • React + TypeScript • Oracle PL/SQL

<p>
  <img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 17" />
  <img src="https://img.shields.io/badge/Spring%20Boot-3.5.7-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Oracle-Database-F80000?style=for-the-badge&logo=oracle&logoColor=white" alt="Oracle" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-3.3-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
</p>

<p><i>A production-style, three-tier hotel management platform — a normalized Oracle schema backed by PL/SQL business logic, a secured Spring Boot REST API, and a role-aware React dashboard.</i></p>

</div>

---

## 📌 Overview

**`hotel_DB`** is a complete hotel operations system, not just a schema. It covers the full guest lifecycle — from signup and room search to check-in, service consumption, check-out, and invoicing — enforced at **three layers**: database constraints/triggers, backend role-based authorization, and a frontend that adapts to the logged-in user's role.

```
┌─────────────────────┐      HTTP / JSON       ┌──────────────────────┐      JDBC       ┌────────────────────┐
│   React + TS SPA     │  ────────────────────▶ │  Spring Boot REST API │ ──────────────▶ │   Oracle Database    │
│  (Vite, Tailwind)     │  ◀──────────────────── │  (Security, JPA)      │ ◀────────────── │  (PL/SQL, Triggers)  │
└─────────────────────┘     Basic Auth + CORS   └──────────────────────┘   Procedures    └────────────────────┘
```

---

## ✨ Feature Highlights

| Domain | Capabilities |
|---|---|
| 🔐 **Auth & Accounts** | Signup/login, profile management, password & username change, HTTP Basic auth |
| 🛏️ **Rooms (Chambre)** | Room catalog with type & nightly rate, live status (`Available` / `Occupied` / `Maintenance`) |
| 📅 **Reservations** | Create, check-in, check-out, cancel, attach services — full booking lifecycle |
| 🧴 **Services** | Amenity/service catalog (e.g. spa, minibar) that can be linked to a stay |
| 💳 **Billing (Facture)** | Auto-generated invoices per reservation, line items, payment status & recording |
| 👥 **Clients** | Registered accounts and **walk-in guests** (no user account required) |
| 🛡️ **Roles & Permissions** | 4-tier RBAC: `ADMIN`, `MANAGER`, `Réceptionniste`, `CLIENT` |
| 📝 **Audit Trail** | `SYSTEM_AUDIT` table + triggers log changes to clients, reservations, invoices & users |

---

## 🧱 Architecture

The project is organized as three cooperating modules in one repository:

```
hotel_DB/
├── Database/         # Oracle PL/SQL: schema, procedures, functions, triggers, roles
│   ├── Creation_BD/       → table & sequence DDL
│   ├── Role/               → DB-level roles + APP_ADMIN / APP_MANAGER / APP_RECEP / APP_CLIENT users
│   ├── Client/              → client CRUD procedures, login check, audit trigger
│   ├── chambre/             → room CRUD, status procedures, service linking
│   ├── Reservation/         → booking lifecycle: create, check-in/out, cancel, availability search
│   ├── facture/             → invoice generation & payment marking
│   └── Factorisation/       → shared billing functions, triggers, line-item procedures
│
├── Backend/           # Spring Boot 3.5.7 REST API (Java 17)
│   └── src/main/java/com/example/Backend/
│       ├── controller/      → REST endpoints
│       ├── service/         → business/auth services
│       ├── repository/      → Spring Data JPA repositories
│       ├── model/           → JPA entities
│       ├── dto/              → request/response payloads
│       └── config/           → Spring Security & CORS configuration
│
└── frontend/           # React 18 + TypeScript SPA (Vite)
    └── src/
        ├── pages/            → Dashboard, Chambres, Reservations, Services, Factures, Clients, Users, Profile, Login, Signup
        ├── components/       → Layout, Toast
        ├── context/           → AuthContext (session/role state)
        └── services/api.ts    → Axios client
```

---

## 🗄️ Database Design

Fully normalized relational schema (3NF), built and versioned as plain PL/SQL scripts — no ORM auto-generation on the DB side.

### Core Tables

| Table | Purpose |
|---|---|
| `ROLE` / `UTILISATEUR` | System roles and user accounts |
| `CLIENT` | Guest profiles — linked to a user account, or standalone for walk-ins |
| `CHAMBRE` | Rooms: number, type, nightly price, status |
| `SERVICE` | Extra amenities/services with unit pricing |
| `RESERVATION` | Bookings, with date-range check constraint (`DATE_FIN >= DATE_DEBUT`) |
| `ASSOCIE` | Many-to-many link between reservations and consumed services |
| `FACTURE` / `LIGNE_FACTURE` | Invoices and their itemized line entries |
| `SYSTEM_AUDIT` | Central audit log (old/new values, actor, timestamp) |

### PL/SQL Business Logic

The database isn't a passive store — key operations are implemented as **stored procedures, functions, and triggers**, so business rules hold regardless of which client calls them:

- **Procedures:** `P_CREER_RESERVATION`, `P_CHECK_IN`, `P_CHECK_OUT`, `P_ANNULER_RESERVATION`, `P_AJOUTER_SERVICE`, `P_GENERATE_FACTURE`, `P_MARK_FACTURE_PAID`, `P_ADD_CLIENT`, `P_ADD_UTILISATEUR`, `P_AJOUTER_CHAMBRE`
- **Functions:** `F_VERIFIER_DISPONIBILITE`, `F_TROUVER_CHAMBRE_LIBRE`, `F_CHECK_LOGIN`, `FNC_CALCULER_MONTANT_FACTURE`, `FNC_GET_STATUT_PAIEMENT`
- **Triggers:** automatic room status updates after check-in/checkout, invoice totals recalculated on line-item changes, and audit trail entries on client, reservation, user & invoice changes

### Database-Level Security (defense in depth)

Beyond the app-level RBAC, the database itself defines **dedicated Oracle roles and users** with least-privilege grants — so even direct DB access respects the same permission tiers:

| DB User | DB Role | Access |
|---|---|---|
| `APP_CLIENT` | `ROLE_CLIENT_DB` | Browse rooms/services, create own reservation |
| `APP_RECEPTION` | `ROLE_RECEPTIONNISTE_DB` | + check-in/out, attach services, generate/mark invoices |
| `APP_MANAGER` | `ROLE_MANAGER_DB` | + manage rooms/services pricing, view audit logs, manage accounts |
| `APP_ADMIN` | `ROLE_ADMIN_DB` | Full privileges |

---

## 🔌 Backend — REST API

Built with **Spring Boot 3.5.7**, **Spring Data JPA**, **Spring Security** (HTTP Basic), and the **Oracle JDBC driver**, secured with route-level authorization mapped directly to the RBAC model above.

| Resource | Endpoint | Notes |
|---|---|---|
| Auth | `POST /auth/signup`, `POST /auth/login`, `GET /auth/profile`, `POST /auth/profile/changepassword`, `POST /auth/profile/changeusername` | Public signup/login, authenticated profile management |
| Rooms | `GET/POST/PUT/DELETE /chambres`, `POST /chambres/add-procedure` | Read open to all authenticated users; writes need `ADMIN`/`MANAGER` |
| Services | `GET /services`, `POST /services/addsevice`, `DELETE /services/{id}` | Same read/write split as rooms |
| Reservations | `POST /reservations/createReservation`, `GET /reservations`, `POST /{id}/checkin`, `POST /{id}/checkout`, `POST /{id}/cancel`, `POST /{resId}/add-service/{serviceId}`, `GET /{resId}/services` | Core booking lifecycle |
| Clients | `GET/POST/DELETE /clients`, `POST /clients/walkin` | Self-service + staff management, walk-in guest support |
| Billing | `GET /factures`, `POST /factures/reservation/{resId}`, `POST /factures/{id}/payer`, `GET/POST /lignes-facture/...` | Restricted to `ADMIN`, `MANAGER`, `Réceptionniste` |
| Admin | `GET/POST/DELETE /utilisateurs`, `GET /roles` | `ADMIN` only |

**Security config highlights:** CSRF disabled for stateless REST use, per-route `HttpMethod` + `hasAuthority` / `hasAnyAuthority` rules, CORS scoped to the frontend origin, and a custom `JpaUserDetailsService` backing Spring Security's authentication provider.

---

## 💻 Frontend — React Dashboard

A **Vite + React 18 + TypeScript** single-page app styled with **Tailwind CSS**, using **React Router** for navigation and **Axios** for API access.

- **Pages:** Login, Signup, Dashboard, Chambres (Rooms), Reservations, Services, Factures (Invoices), Clients, Users, Profile
- **Auth flow:** `AuthContext` holds the session; credentials are used for HTTP Basic auth and the UI adapts to the user's role
- **Protected routing:** a `PrivateRoute` wrapper guards the authenticated app shell (`Layout`) from unauthenticated access

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Database** | Oracle Database (XE), PL/SQL — Procedures, Functions, Triggers, Sequences |
| **Backend** | Java 17, Spring Boot 3.5.7, Spring Data JPA, Spring Security, Oracle JDBC (`ojdbc11`), Bean Validation, Maven |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router 6, Axios, date-fns, react-icons |

---

## 🚀 Getting Started

### Prerequisites

- **Oracle Database XE** (or compatible Oracle instance) running locally
- **Java 17** and **Maven** (or use the bundled `mvnw`)
- **Node.js 18+** and **npm**

### 1. Set up the database

Run the scripts in order against your Oracle instance (as `SYSTEM` or an appropriately privileged user):

```bash
# 1. Create schema: tables & sequences
Database/Creation_BD/Tables.txt

# 2. Create DB roles & privileged app users (APP_ADMIN, APP_MANAGER, APP_RECEP, APP_CLIENT)
Database/Role/script_Roles_users/Roles_Users.txt

# 3. Load stored procedures, functions & triggers
Database/**/*.sql
```

### 2. Run the backend

```bash
cd Backend
```

Update `src/main/resources/application.properties` with your Oracle connection details:

```properties
spring.datasource.url=jdbc:oracle:thin:@//localhost:1521/XE
spring.datasource.username=system
spring.datasource.password=your_password
```

Then start the API (defaults to `http://localhost:8080`):

```bash
./mvnw spring-boot:run
```

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000` and expects the backend at `http://localhost:8080`.

> ⚠️ If you hit CORS errors, confirm the frontend origin matches `SecurityConfig.corsConfigurationSource()` in the backend.

---

## 🔒 Role-Based Access Summary

| Role | Access |
|---|---|
| **ADMIN** | Full control — users, roles, rooms, services, billing, reservations |
| **MANAGER** | Rooms, services, invoices, clients, reservations |
| **Réceptionniste** | Reservations, billing, client management, check-in/out |
| **CLIENT** | Own profile and own reservations |

---

## 📄 License

No license has been specified for this project yet. All rights reserved by the author unless stated otherwise.

---

<div align="center">
  <sub>Built by <a href="https://github.com/mohamed215686">mohamed215686</a></sub>
</div>
