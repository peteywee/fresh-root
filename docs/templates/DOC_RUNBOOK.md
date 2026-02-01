---

title: "Service Runbook Template"
description: "Template for operational runbooks with incident response procedures"
keywords:
- template
- runbook
- operations
- incident-response
- procedures
category: "template"
status: "active"
audience:
- operators
- developers
related-docs:
- DOC\_SPEC.md
- ../production/README.md

createdAt: "2026-01-31T12:00:00Z"
lastUpdated: "2026-01-31T12:00:00Z"

---

# Template: DOC_RUNBOOK

## ${Service} Runbook

**Owner:** ${Owner} **SLOs:** ${SLOs} **Pager:** ${Pager}

## Overview

${Description}

## Dashboards

- ${Dashboards}

## Alerts

- ${Alerts}

## Common Incidents

1. Symptom → Check → Mitigation → Verification

## Rollback

Steps:

1. ${RollbackStep1}
2. ${RollbackStep2}

## Dependencies

- ${Dependencies}

## DR / Backups

- ${DR}
