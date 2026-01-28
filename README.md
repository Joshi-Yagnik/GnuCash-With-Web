# 💰 Finance Web With GnuCash Import

Finance Web With GnuCash Import is a comprehensive personal finance management system designed for power users. It features multi-book architecture, double-entry accounting with splits, and extensive planning tools.

---

## 📌 Key Features

### 🏢 Multi-Book Architecture
- Manage completely separate financial portfolios ("Books") under one user account.
- Switch between Personal, Business, or Family books instantly.
- Share specific books with other users via email invitation (Viewer/Editor/Admin roles).

### 📓 Advanced Accounting
- **Double-Entry System**: Every transaction balances perfectly.
- **Split Transactions**: One transaction can affect multiple accounts (e.g., Salary split into Checking, Tax, and Savings).
- **Account Hierarchy**: Organize accounts with infinite nesting (Assets > Current Assets > Bank).

### 📊 Planning & Analysis
- **Budgeting**: Set monthly budgets per category and track progress with visual health indicators.
- **Recurring Transactions**: Schedule income/expenses to repeat daily, weekly, monthly, or yearly.
- **Reports**: View Spending Trends, Income vs. Expense, and Category Breakdowns.

### 🛠️ Core Utilities
- **Global Search**: Instantly find any transaction or account.
- **Favorites**: Pin frequently used accounts for quick access.
- **Import/Export**: Support for CSV and GnuCash XML formats.
- **Dark/Light Theme**: Fully responsive modern UI.

---

## 📚 Documentation & Diagrams

We maintain detailed architectural documentation to help developers understand the system.

**[👉 View All Diagrams (Interactive Index)](docs/diagrams/index.html)**

### Workflow Diagrams
- **[Complete Workflow](docs/diagrams/workflow_chart.html)**: The entire system in one view.
- **[Auth & Init Flow](docs/diagrams/workflow_auth.html)**: detailed look at login, signup, and user setups.
- **[Core Operations](docs/diagrams/workflow_core.html)**: Daily tasks like adding transactions and managing accounts.
- **[Management Flow](docs/diagrams/workflow_management.html)**: Setting up Books, Budgets, and Structures.
- **[Analysis Flow](docs/diagrams/workflow_analysis.html)**: Reporting, Settings, and System tools.

### Technical Diagrams
- **[Database Schema (ERD)](docs/diagrams/er_diagram.html)**: Visual guide to our 12+ Firestore collections and relationships.
- **[Class Diagram](docs/diagrams/class_diagram.html)**: UML representation of our code entities.
- **Sequence Diagrams**: Detailed interactions for [Transactions](docs/diagrams/sequence_transaction.html), [Budgets](docs/diagrams/sequence_budget.html), and [Multi-Book](docs/diagrams/sequence_multibook.html) logic.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn/UI
- **Backend/Database**: Firebase (Authentication, Firestore, Hosting)
- **Diagrams**: Mermaid.js

---

## 📂 Repository

**GitHub:** [https://github.com/Joshi-Yagnik/GnuCash-With-Web](https://github.com/Joshi-Yagnik/GnuCash-With-Web)

---

## 🚀 Getting Started

### Prerequisites
Make sure **Node.js** and **npm** are installed.

```bash
node -v
npm -v
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
