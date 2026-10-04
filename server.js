require('dotenv').config();
const express = require('express');
const path = require('path');
const pool = require('./database/db');
const expensesRouter = require('./routes/expenses');

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/expenses', expensesRouter);
app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));
app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  res.status(500).json({ error: 'Server error. Check the server console and MySQL connection.' });
});

async function start() {
  try {
    await pool.query('SELECT 1');
    app.listen(port, () => console.log(`Expense Tracker is running at http://localhost:${port}`));
  } catch (error) {
    console.error('Could not connect to MySQL. Check MySQL80, database/schema.sql, and your .env settings.');
    console.error(error.message);
    process.exit(1);
  }
}

start();
