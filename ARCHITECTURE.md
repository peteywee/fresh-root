# Architecture & Technical Specifications

**🔗 Primary Sources**: `/infrastructure/README.md`, `/visuals/INFORMATION_ARCHITECTURE.md`  
**Auto-maintained by**: `.github/workflows/maintain-docs.yml`  
**Last Updated**: December 7, 2025

---

## System Architecture Overview

Fresh Schedules is built on a modern, scalable architecture:

### Tech Stack
- **Frontend**: Next.js 16 (React 19) + Tailwind CSS
- **Backend**: Firebase Admin SDK + Cloud Functions
- **Data Layer**: Firestore + Cloud Storage
- **Real-time**: Pub/Sub + WebSockets
- **Authentication**: Firebase Auth + Session Cookies
- **DevOps**: GitHub Actions + Cloud Build

### Core Layers

#### Data Layer
- **Firestore**: Primary document database
- **Schema**: Organization-scoped collections
- **Security**: Rules-based authorization
- **Details**: [/infrastructure/FIRESTORE_SCHEMA.md](/infrastructure/FIRESTORE_SCHEMA.md)

#### API Layer
- **Framework**: Next.js API Routes + SDK Factory
- **Pattern**: RESTful with Zod validation
- **Authorization**: Hierarchical RBAC
- **Details**: [/infrastructure/API_ENDPOINTS.md](/infrastructure/API_ENDPOINTS.md)

#### Compute Layer
- **Functions**: Cloud Functions + Cloud Run
- **Orchestration**: Pub/Sub event-driven
- **Deployment**: GitHub Actions CI/CD
- **Details**: [/infrastructure/CLOUD_FUNCTIONS.md](/infrastructure/CLOUD_FUNCTIONS.md)

#### Real-time Layer
- **Features**: Live collaboration, notifications
- **Protocol**: WebSockets + Server-Sent Events
- **Details**: [/infrastructure/REALTIME_COLLABORATION.md](/infrastructure/REALTIME_COLLABORATION.md)

#### Observability
- **Logging**: Cloud Logging + structured logs
- **Monitoring**: Cloud Monitoring + custom metrics
- **Tracing**: Distributed tracing via request IDs
- **Details**: [/infrastructure/OBSERVABILITY.md](/infrastructure/OBSERVABILITY.md)

## Complete Technical Documentation

### Infrastructure
- [/infrastructure/README.md](/infrastructure/README.md) - Overview
- [/infrastructure/FIRESTORE_SCHEMA.md](/infrastructure/FIRESTORE_SCHEMA.md) - Database design
- [/infrastructure/API_ENDPOINTS.md](/infrastructure/API_ENDPOINTS.md) - API specifications
- [/infrastructure/CLOUD_FUNCTIONS.md](/infrastructure/CLOUD_FUNCTIONS.md) - Serverless compute
- [/infrastructure/OBSERVABILITY.md](/infrastructure/OBSERVABILITY.md) - Monitoring & logging

### Visuals
- [/visuals/INFORMATION_ARCHITECTURE.md](/visuals/INFORMATION_ARCHITECTURE.md) - System diagrams
- [/visuals/ARCHIVE_OVERVIEW.md](/visuals/ARCHIVE_OVERVIEW.md) - Repository structure
- [/visuals/NAVIGATION_STRATEGY.md](/visuals/NAVIGATION_STRATEGY.md) - Navigation design

### Design Patterns
- [/patterns/API_ROUTE_STANDARD.md](/patterns/API_ROUTE_STANDARD.md) - API endpoint template
- [/patterns/DATA_ARCHITECTURE.md](/patterns/DATA_ARCHITECTURE.md) - Data models
- [/patterns/COMPONENT_PATTERNS.md](/patterns/COMPONENT_PATTERNS.md) - React components

---

**ℹ️  This is a navigation hub. Detailed architecture documentation lives in the respective domain folders.**
