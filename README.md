# Healthcare Eligibility & Prior Authorization Checker

A WhatsApp-based automation that checks member eligibility and prior authorization
requirements using n8n, with Baileys for WhatsApp integration during development.

## Status: In Progress (Day 1-2)
- [x] Webhook receiving WhatsApp-style messages
- [x] Code node parsing memberId and cptCode from message text
- [ ] Google Sheets lookup (Members + CPT Prior Auth Rules)
- [ ] Decision engine
- [ ] PostgreSQL logging
- [ ] WhatsApp reply via Baileys

## Architecture
WhatsApp (Baileys) → Webhook → n8n → Google Sheets → Decision Engine → PostgreSQL → WhatsApp Reply
