# Healthcare Eligibility & Prior Authorization Checker

## ✅ Project Status: COMPLETE

Built by Sreenivasulu Dandiga (DSY) | Healthcare IT / RCM Automation

## Architecture
WhatsApp (Baileys) → n8n Webhook → Message Parser → Members Sheet → CPT Rules → Decision Engine → PostgreSQL → Google Sheets → WhatsApp Reply

## Features
- ✅ Real-time eligibility checks via WhatsApp
- ✅ Prior authorization decision engine
- ✅ PostgreSQL audit logging
- ✅ Google Sheets Decision_Log append
- ✅ 3 decision scenarios (Eligible / Inactive / Prior Auth Required)

## Test Cases
| Command | Expected Result |
|---------|----------------|
| CHECK MBR10234 99213 | ✅ Eligible - No Prior Auth |
| CHECK MBR10235 99213 | ⚠️ Inactive Coverage |
| CHECK MBR10234 99215 | ⚠️ Prior Auth REQUIRED |

## Tech Stack
- n8n (workflow orchestration)
- Google Sheets (reference data)
- PostgreSQL 18 (audit log)
- Baileys (WhatsApp automation)
- Node.js, Nginx, Docker
- VPS: Ubuntu 24.04 (Contabo)

## Live Demo
- n8n: https://n8n.sreeniverse.com
- GitHub: https://github.com/Sreeni1023/eligibility-prior-auth-checker
