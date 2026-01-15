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
  - DOC_SPEC.md
  - ../production/README.md
---

# Template: DOC\_RUNBOOK
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
