# Expense Tracker

A simple college project using HTML, CSS, browser JavaScript, Node.js, Express, and MySQL.

## Quick setup (Windows / VS Code)

1. Open this project folder in VS Code. Open **Terminal → New Terminal**.
2. Install packages: `npm install`
3. Start MySQL80 from Windows Services if it is not already running. Open MySQL Workbench and connect to your local server.
4. Open `database/schema.sql` in Workbench and click the lightning-bolt **Execute** button. It creates `expense_tracker` and its `expenses` table.
5. Open `.env` in VS Code. Set `DB_USER` to your MySQL account (often `root`) and replace `DB_PASSWORD` with that account's password. Keep `.env` private; it is excluded from Git. Do not add quote marks unless your password itself needs them.
6. In VS Code Terminal, start the app: `npm start`
7. Visit `http://localhost:3000` in your browser. Keep the terminal open while using the app.

If the database connection fails, check that MySQL80 is running, Workbench can connect with the same user/password, the schema script ran successfully, and `DB_PORT` matches your local MySQL port (normally 3306).

## Try the features

- Add: enter a title, positive amount, category, and date; description is optional; click **Add expense**.
- View: saved rows appear in the Expenses table. Refresh the browser to confirm they came from MySQL.
- Edit: click **Edit**, change a field, and click **Save changes**. Use **Cancel** to leave edit mode.
- Delete: click **Delete** and confirm.
- Filter: choose a category above the table. Choose **All categories** to clear the filter.
- Total: the card shows the sum for the visible rows; when filtered, it shows that category's subtotal. Clear the filter to see the overall total.

## Project files

- `server.js` starts Express, checks the MySQL connection, serves the frontend, and handles errors.
- `database/schema.sql` creates the database and table in Workbench.
- `database/db.js` configures the `mysql2` connection pool from environment variables.
- `routes/expenses.js` contains the REST API and parameterized SQL for create, read, update, delete, and category filtering.
- `public/index.html` contains the page structure and expense form/table.
- `public/style.css` defines the responsive page appearance.
- `public/script.js` sends Fetch API requests, renders records, validates interactions, and calculates the visible total.
- `.env` contains local database settings and is ignored by Git; `.env.example` documents the required keys.
- `package.json` lists dependencies and start commands; `.gitignore` excludes local secrets and installed packages.

## How the parts work together

**HTML** lays out the form, total card, filter, and table. **CSS** styles and adapts that page to smaller screens. **JavaScript** reads form values and uses the Fetch API to send JSON requests to **Express.js**. Express checks the request and calls **MySQL** through `mysql2`; MySQL saves or returns actual rows. Express sends JSON back, and JavaScript updates the page without reloading it.

## API routes

- `GET /api/expenses` (optional `?category=Food`)
- `GET /api/expenses/:id`
- `POST /api/expenses`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`
