const express = require('express');
const pool = require('../database/db');

const router = express.Router();
const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Education', 'Other'];
const fields = ['title', 'amount', 'category', 'date', 'description'];

function validateExpense(body) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const amount = Number(body.amount);
  const category = body.category;
  const date = body.date;
  if (!title || title.length > 120) return 'Title is required and must be at most 120 characters.';
  if (!Number.isFinite(amount) || amount <= 0 || amount > 99999999.99) return 'Amount must be a positive number.';
  if (!categories.includes(category)) return 'Choose a valid category.';
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00`))) return 'Enter a valid date.';
  if (body.description != null && typeof body.description !== 'string') return 'Description must be text.';
  return null;
}

router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;
    if (category && !categories.includes(category)) return res.status(400).json({ error: 'Invalid category filter.' });
    const sql = category
      ? 'SELECT id, title, amount, category, expense_date AS date, description, created_at FROM expenses WHERE category = ? ORDER BY expense_date DESC, id DESC'
      : 'SELECT id, title, amount, category, expense_date AS date, description, created_at FROM expenses ORDER BY expense_date DESC, id DESC';
    const [rows] = await pool.execute(sql, category ? [category] : []);
    res.json(rows);
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT id, title, amount, category, expense_date AS date, description, created_at FROM expenses WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Expense not found.' });
    res.json(rows[0]);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const issue = validateExpense(req.body);
    if (issue) return res.status(400).json({ error: issue });
    const { title, amount, category, date, description = '' } = req.body;
    const [result] = await pool.execute('INSERT INTO expenses (title, amount, category, expense_date, description) VALUES (?, ?, ?, ?, ?)', [title.trim(), Number(amount), category, date, description.trim()]);
    const [rows] = await pool.execute('SELECT id, title, amount, category, expense_date AS date, description, created_at FROM expenses WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const issue = validateExpense(req.body);
    if (issue) return res.status(400).json({ error: issue });
    const { title, amount, category, date, description = '' } = req.body;
    const [result] = await pool.execute('UPDATE expenses SET title = ?, amount = ?, category = ?, expense_date = ?, description = ? WHERE id = ?', [title.trim(), Number(amount), category, date, description.trim(), req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Expense not found.' });
    const [rows] = await pool.execute('SELECT id, title, amount, category, expense_date AS date, description, created_at FROM expenses WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.execute('DELETE FROM expenses WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Expense not found.' });
    res.status(204).end();
  } catch (error) { next(error); }
});

module.exports = router;
