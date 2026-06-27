const express = require('express');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  database: 'sreeniverse_db',
  user: 'postgres',
  password: 'AhJ4RjzOaOj5PIJoetJcLSysx',
});

app.get('/dashboard', async (req, res) => {
  try {
    const total = await pool.query("SELECT COUNT(*) FROM decision_log");
    const today = await pool.query("SELECT COUNT(*) FROM decision_log WHERE created_at::date = CURRENT_DATE");
    const eligible = await pool.query("SELECT COUNT(*) FROM decision_log WHERE decision LIKE '%Eligible%'");
    const priorAuth = await pool.query("SELECT COUNT(*) FROM decision_log WHERE decision LIKE '%Prior Authorization REQUIRED%'");
    const inactive = await pool.query("SELECT COUNT(*) FROM decision_log WHERE decision LIKE '%coverage is%'");
    const topCPT = await pool.query("SELECT cpt_code, COUNT(*) as cnt FROM decision_log WHERE cpt_code != 'undefined' GROUP BY cpt_code ORDER BY cnt DESC LIMIT 5");
    const recent = await pool.query("SELECT id, member_id, cpt_code, phone_number, LEFT(decision,50) as decision, TO_CHAR(created_at, 'DD-Mon-YYYY HH24:MI') as time FROM decision_log ORDER BY created_at DESC LIMIT 10");

    const t = parseInt(total.rows[0].count);
    const e = parseInt(eligible.rows[0].count);
    const p = parseInt(priorAuth.rows[0].count);
    const i = parseInt(inactive.rows[0].count);
    const approvalRate = t > 0 ? Math.round((e/t)*100) : 0;
    const paRate = t > 0 ? Math.round((p/t)*100) : 0;
    const denialRate = t > 0 ? Math.round((i/t)*100) : 0;

    const topCPTRows = topCPT.rows.map(r => `
      <tr>
        <td>${r.cpt_code}</td>
        <td><div class="bar-wrap"><div class="bar" style="width:${Math.round((r.cnt/t)*100)}%"></div></div></td>
        <td>${r.cnt}</td>
      </tr>`).join('');

    const recentRows = recent.rows.map(r => `
      <tr>
        <td>${r.id}</td>
        <td><span class="badge">${r.member_id}</span></td>
        <td>${r.cpt_code}</td>
        <td>${r.phone_number || '-'}</td>
        <td class="${r.decision.includes('Eligible') ? 'green' : r.decision.includes('Prior') ? 'orange' : 'red'}">${r.decision}...</td>
        <td>${r.time}</td>
      </tr>`).join('');

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HC Eligibility Dashboard | DSY</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', sans-serif; background: #0f1724; color: #e0e6f0; }
  header { background: linear-gradient(135deg, #1a2a4a, #0d3b6e); padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2e74b5; }
  header h1 { font-size: 22px; color: #4fc3f7; }
  header p { font-size: 13px; color: #90a4ae; }
  .live { background: #1b5e20; color: #69f0ae; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
  .container { padding: 30px 40px; }
  .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
  .card { background: #1a2535; border-radius: 12px; padding: 24px; border-left: 4px solid; }
  .card.blue { border-color: #2196f3; }
  .card.green { border-color: #4caf50; }
  .card.orange { border-color: #ff9800; }
  .card.red { border-color: #f44336; }
  .card .label { font-size: 12px; color: #90a4ae; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .card .value { font-size: 36px; font-weight: bold; }
  .card.blue .value { color: #4fc3f7; }
  .card.green .value { color: #69f0ae; }
  .card.orange .value { color: #ffb74d; }
  .card.red .value { color: #ef9a9a; }
  .card .sub { font-size: 12px; color: #607d8b; margin-top: 6px; }
  .grid2 { display: grid; grid-template-columns: 1fr 2fr; gap: 20px; margin-bottom: 30px; }
  .box { background: #1a2535; border-radius: 12px; padding: 24px; }
  .box h3 { font-size: 14px; color: #90a4ae; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #263545; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 10px 12px; font-size: 12px; color: #607d8b; text-transform: uppercase; border-bottom: 1px solid #263545; }
  td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #1e2d3d; }
  tr:hover td { background: #1e2d3d; }
  .badge { background: #0d3b6e; color: #4fc3f7; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
  .green { color: #69f0ae; }
  .orange { color: #ffb74d; }
  .red { color: #ef9a9a; }
  .bar-wrap { background: #263545; border-radius: 4px; height: 8px; width: 100px; }
  .bar { background: #2196f3; border-radius: 4px; height: 8px; }
  .rate-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .rate-item { text-align: center; padding: 16px; background: #0f1724; border-radius: 8px; }
  .rate-item .pct { font-size: 28px; font-weight: bold; margin-bottom: 4px; }
  .rate-item .lbl { font-size: 11px; color: #607d8b; text-transform: uppercase; }
  footer { text-align: center; padding: 20px; color: #37474f; font-size: 12px; border-top: 1px solid #1a2535; }
</style>
</head>
<body>
<header>
  <div>
    <h1>🏥 HC Eligibility & Prior Auth Dashboard</h1>
    <p>Sreenivasulu Dandiga (DSY) | sreeniverse.com | Real-time RCM Analytics</p>
  </div>
  <span class="live">● LIVE</span>
</header>

<div class="container">
  <div class="cards">
    <div class="card blue">
      <div class="label">Total Checks</div>
      <div class="value">${t}</div>
      <div class="sub">All time</div>
    </div>
    <div class="card green">
      <div class="label">Eligible</div>
      <div class="value">${e}</div>
      <div class="sub">No prior auth needed</div>
    </div>
    <div class="card orange">
      <div class="label">Prior Auth Required</div>
      <div class="value">${p}</div>
      <div class="sub">PA submission needed</div>
    </div>
    <div class="card red">
      <div class="label">Inactive Coverage</div>
      <div class="value">${i}</div>
      <div class="sub">Claim will be denied</div>
    </div>
  </div>

  <div class="grid2">
    <div class="box">
      <h3>Decision Rates</h3>
      <div class="rate-grid">
        <div class="rate-item">
          <div class="pct green">${approvalRate}%</div>
          <div class="lbl">Approval</div>
        </div>
        <div class="rate-item">
          <div class="pct orange">${paRate}%</div>
          <div class="lbl">Prior Auth</div>
        </div>
        <div class="rate-item">
          <div class="pct red">${denialRate}%</div>
          <div class="lbl">Denial</div>
        </div>
      </div>
      <br/>
      <h3>Top CPT Codes</h3>
      <table>
        <thead><tr><th>CPT</th><th>Volume</th><th>Count</th></tr></thead>
        <tbody>${topCPTRows}</tbody>
      </table>
    </div>

    <div class="box">
      <h3>Recent Decisions</h3>
      <table>
        <thead><tr><th>#</th><th>Member</th><th>CPT</th><th>Phone</th><th>Decision</th><th>Time</th></tr></thead>
        <tbody>${recentRows}</tbody>
      </table>
    </div>
  </div>
</div>

<footer>HC Eligibility & Prior Auth Checker | Built by Sreenivasulu Dandiga (DSY) | GitHub: Sreeni1023 | Auto-refreshes every 30s</footer>
<script>setTimeout(()=>location.reload(), 30000);</script>
</body>
</html>`);
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

app.listen(5050, () => console.log('Dashboard running on port 5050'));
