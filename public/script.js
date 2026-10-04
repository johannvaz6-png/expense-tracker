const form = document.getElementById('expenseForm');
const rows = document.getElementById('expenseRows');
const categoryFilter = document.getElementById('categoryFilter');
const emptyState = document.getElementById('emptyState');
const totalAmount = document.getElementById('totalAmount');
const totalCount = document.getElementById('totalCount');
const formMessage = document.getElementById('formMessage');
const listMessage = document.getElementById('listMessage');
const submitButton = document.getElementById('submitButton');
const cancelEditButton = document.getElementById('cancelEdit');
let editingId = null;

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }
  });
  if (response.status === 204) return null;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'The request could not be completed.');
  return payload;
}

function showMessage(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle('error', isError);
}

function displayDate(value) {
  if (!value) return '';
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(year, month - 1, day));
}

function renderExpenses(expenses) {
  rows.innerHTML = expenses.map((expense) => `
    <tr>
      <td><span class="expense-title">${escapeHtml(expense.title)}</span>${expense.description ? `<span class="expense-description">${escapeHtml(expense.description)}</span>` : ''}</td>
      <td><span class="category-badge">${escapeHtml(expense.category)}</span></td>
      <td>${escapeHtml(displayDate(expense.date))}</td>
      <td class="amount-cell">${currency.format(Number(expense.amount))}</td>
      <td><div class="actions"><button class="row-button" type="button" data-action="edit" data-id="${Number(expense.id)}">Edit</button><button class="row-button delete" type="button" data-action="delete" data-id="${Number(expense.id)}">Delete</button></div></td>
    </tr>`).join('');
  emptyState.classList.toggle('hidden', expenses.length !== 0);
  totalAmount.textContent = currency.format(expenses.reduce((sum, item) => sum + Number(item.amount), 0));
  totalCount.textContent = `${expenses.length} ${expenses.length === 1 ? 'expense' : 'expenses'}${categoryFilter.value ? ` · ${categoryFilter.value}` : ''}`;
}

async function loadExpenses() {
  showMessage(listMessage, '');
  try {
    const query = categoryFilter.value ? `?category=${encodeURIComponent(categoryFilter.value)}` : '';
    const expenses = await api(`/api/expenses${query}`);
    renderExpenses(expenses);
  } catch (error) {
    rows.innerHTML = '';
    emptyState.classList.add('hidden');
    totalAmount.textContent = '—';
    totalCount.textContent = 'Unable to load expenses';
    showMessage(listMessage, error.message, true);
  }
}

function resetForm() {
  form.reset();
  editingId = null;
  document.getElementById('formHeading').textContent = 'Add an expense';
  submitButton.textContent = 'Add expense';
  cancelEditButton.classList.add('hidden');
  showMessage(formMessage, '');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(form).entries());
  const wasEditing = editingId !== null;
  try {
    await api(editingId ? `/api/expenses/${editingId}` : '/api/expenses', {
      method: editingId ? 'PUT' : 'POST', body: JSON.stringify(payload)
    });
    resetForm();
    await loadExpenses();
    showMessage(formMessage, wasEditing ? 'Expense updated successfully.' : 'Expense saved successfully.');
  } catch (error) {
    showMessage(formMessage, error.message, true);
  }
});

rows.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const id = button.dataset.id;
  if (button.dataset.action === 'edit') {
    try {
      const expense = await api(`/api/expenses/${id}`);
      editingId = expense.id;
      for (const field of ['title', 'amount', 'category', 'date', 'description']) {
        form.elements[field].value = expense[field] ?? '';
      }
      document.getElementById('formHeading').textContent = 'Edit expense';
      submitButton.textContent = 'Save changes';
      cancelEditButton.classList.remove('hidden');
      showMessage(formMessage, 'Update the details and save your changes.');
      document.getElementById('title').focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) { showMessage(listMessage, error.message, true); }
  }
  if (button.dataset.action === 'delete') {
    if (!window.confirm('Delete this expense? This action cannot be undone.')) return;
    try {
      await api(`/api/expenses/${id}`, { method: 'DELETE' });
      if (String(editingId) === id) resetForm();
      await loadExpenses();
    } catch (error) { showMessage(listMessage, error.message, true); }
  }
});

cancelEditButton.addEventListener('click', resetForm);
categoryFilter.addEventListener('change', loadExpenses);
loadExpenses();


