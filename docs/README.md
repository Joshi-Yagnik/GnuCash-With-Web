# Finance Web With GnuCash Import - Documentation

**Project:** Finance Web With GnuCash Import (formerly Finance Joshi)  
**Version:** 2.0  
**Date:** January 28, 2026  

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Documentation Index](#documentation-index)
3. [Key Features](#key-features)
4. [Architecture & Database](#architecture--database)
5. [Technology Stack](#technology-stack)
6. [Development Roadmap](#development-roadmap)

---

## Project Overview

**Finance Web With GnuCash Import** is an advanced personal finance system designed for power users who need more than just simple expense tracking. It introduces a **Multi-Book Architecture**, allowing you to manage distinct financial portfolios (e.g., Personal, Business, Family) from a single account.

It fully supports **Double-Entry Accounting**, ensuring that every transaction balances perfectly (Assets = Liabilities + Equity).

---

## Documentation Index

We maintain extensive documentation diagrams to visualize the system.

### 📊 [Interactive Diagrams Index (Start Here)](diagrams/index.html)

**Diagram Categories:**
*   **Workflows**: [Complete](diagrams/workflow_chart.html), [Auth](diagrams/workflow_auth.html), [Core Ops](diagrams/workflow_core.html), [Management](diagrams/workflow_management.html), [Analysis](diagrams/workflow_analysis.html).
*   **Architecture**: [Database Schema (ERD)](diagrams/er_diagram.html), [Class Diagram](diagrams/class_diagram.html).
*   **Deep Dives**: [Transaction Sequence](diagrams/sequence_transaction.html), [Budget Sequence](diagrams/sequence_budget.html), [Multi-Book Sequence](diagrams/sequence_multibook.html).

---

## Key Features

### 🏢 Multi-Book Support
*   Create unlimited separate "Books" (Portfolios).
*   Switch context instantly (like Slack workspaces).
*   Share books with other users via email invitations.

### 📓 Advanced Accounting
*   **Splits**: One transaction, multiple accounts (e.g., Salary → Checking, Tax, 401k).
*   **Hierarchy**: Nested accounts (Assets → Bank → Chase Checking).
*   **Reconciliation**: Mark transactions as unreconciled, cleared, or reconciled.

### 💰 Planning Tools
*   **Budgets**: Visual monthly budget tracking per category.
*   **Recurring**: Automated recurring transactions (Daily, Weekly, Monthly, Yearly).
*   **Tags**: Flexible tagging system for cross-category analysis.

### 🛠️ Utilities
*   **Global Search**: Command-K style search for anything.
*   **Import**: Full GnuCash XML and generic CSV support.
*   **Export**: Data portability via JSON/CSV.

---

## Architecture & Database

The system uses **Google Firestore** (NoSQL) with a highly nested, scalable structure.

### Database Schema (Simplified)

```text
users/
  {userId}/
    profile: { email, name, photoURL }
    settings: { theme, currency }

books/
  {bookId}/
    details: { name, ownerId, currency }
    
    accounts/
      {accountId}/ { name, type, parentId, balance }
      
    transactions/
      {transactionId}/ { date, description, splits: [] }
      
    categories/
      {categoryId}/ { name, type }
      
    budgets/
      {budgetId}/ { amount, period, categoryId }
      
    recurring/
      {recurringId}/ { frequency, nextRunDate }
```

> **Note**: For the full schema with types, see the [E-R Diagram](diagrams/er_diagram.html).

---

## Technology Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **UI Framework** | Tailwind CSS, Shadcn/UI |
| **State** | React Context API |
| **Backend** | Firebase (Auth, Firestore, Hosting) |
| **Diagrams** | Mermaid.js |

---

## Development Roadmap

### ✅ Completed
*   Multi-book Architecture
*   Authentication & User Init
*   Double-Entry Transaction Engine
*   Account Hierarchy & Favorites
*   Budgeting & Recurring Transactions
*   Reports & Analytics
*   GnuCash Import

### 🔄 In Progress
*   Mobile Refinements
*   Advanced Reporting Filters

### 📅 Planned
*   Offline Mode (PWA)
*   Collaborator Permissions (Read-only vs Edit)

---

**Last Updated:** January 28, 2026 | Version 2.0
