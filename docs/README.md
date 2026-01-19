# Finance Joshi - Complete Project Documentation

**Project:** Finance Joshi - Personal Finance Management System  
**Version:** 1.0  
**Date:** January 19, 2026  

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Diagrams](#diagrams)
3. [Technology Stack](#technology-stack)
4. [Features](#features)
5. [Development Phases](#development-phases)
6. [Database Schema](#database-schema)
7. [How to View Diagrams](#how-to-view-diagrams)

---

## Project Overview

Finance Joshi is a modern web-based personal finance management application built with React, TypeScript, and Firebase. It enables users to:

- ✅ Track multiple financial accounts (assets, liabilities)
- ✅ Record income, expense, and transfer transactions
- ✅ Categorize transactions for better insights
- ✅ View financial reports and analytics
- ✅ Manage user profiles with photo upload
- ✅ Sync data in real-time across devices

---

## 📊 Diagrams

All diagrams are available in both **Markdown format** (with Mermaid code) and **HTML format** (ready to view in browser and save as images).

### Available Diagrams

#### 1. Project Workflow Chart
**Files:**
- Markdown: `../brain/.../project_workflow_chart.md`
- HTML: `diagrams/workflow_chart.html`

**Description:** Complete user journey from authentication through all major features (accounts, transactions, reports, profile management).

---

#### 2. Data Flow Diagrams (DFD)
**Files:**
- Markdown: `../brain/.../data_flow_diagrams.md`
- HTML Files:
  - `diagrams/dfd_level_0.html` - Context Diagram
  - `diagrams/dfd_level_1.html` - System Overview
  - `diagrams/dfd_level_2_transaction.html` - Transaction Management Details

**Description:**
- **Level 0:** Shows the system as a single process with external entities (User, Google OAuth, Email Service)
- **Level 1:** Breaks down into 6 major processes and 6 data stores
- **Level 2:** Detailed view of Transaction Management and Authentication processes

---

#### 3. Class Diagram
**Files:**
- Markdown: `../brain/.../class_diagram.md`
- HTML: `diagrams/class_diagram.html`

**Description:** Complete UML class diagram showing all entities (User, Account, Transaction, Split, Category, UserProfile) with attributes, methods, and relationships.

---

#### 4. Project Plan
**File:** `../brain/.../project_plan.md`

**Description:** Comprehensive project plan including:
- Objectives and scope
- Technology stack
- 11 development phases
- Timeline (Gantt chart)
- Testing strategy
- Deployment plan
- Risk management
- Future enhancements

---

## How to View Diagrams

### Method 1: View HTML Files in Browser
1. Navigate to `docs/diagrams/` folder
2. Double-click any `.html` file
3. The diagram will render in your default browser
4. **To save as image:**
   - Right-click on the diagram → "Save image as..."
   - Or press F12 → Ctrl+Shift+P → Type "screenshot" → "Capture full size screenshot"

### Method 2: View Markdown Files
1. Open the markdown files in any Mermaid-compatible viewer:
   - **VS Code** (with Mermaid extension)
   - **GitHub** (upload and view)
   - **Online Mermaid Editors** (https://mermaid.live/)

### Method 3: Copy to Documentation

All diagrams can be exported as images and included in:
- Project reports
- PowerPoint presentations
- Technical documentation
- Client presentations
- Academic projects

---

## Technology Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | TailwindCSS, shadcn/ui |
| **Routing** | React Router 6 |
| **Backend** | Firebase (Auth, Firestore, Storage) |
| **Charts** | Recharts |
| **Icons** | Lucide React |

---

## Features Summary

### Authentication
- Email/password signup and login
- Google OAuth integration
- Email verification
- Password reset

### User Management
- User profile creation
- Profile photo upload
- Display name management
- Automatic initialization for new users

### Account Management
- Create, edit, delete accounts
- Support for 4 account types (Asset, Liability, Income, Expense)
- Real-time balance tracking
- Customizable icons and colors

### Transaction Management
- Add income, expense, and transfer transactions
- Transaction categorization
- Split transactions (double-entry accounting)
- Edit and delete transactions
- Automatic balance updates

### Reports & Analytics
- Category distribution charts
- Spending trends over time
- Income vs expense comparison
- Date range filtering
- Category-wise breakdown

### Profile Features
- Upload/change profile photo
- Update display name
- View account information
- Manage preferences

---

## Database Schema (Firestore)

### Collections Structure

```
users/
  {userId}/
    - name: string
    - email: string
    - photoURL: string
    - isInitialized: boolean
    - createdAt: timestamp
    - updatedAt: timestamp
    
    accounts/
      {accountId}/
        - name: string
        - type: 'asset' | 'liability' | 'income' | 'expense'
        - balance: number
        - currency: string
        - color: string
        - icon: string
        - createdAt: timestamp
        - updatedAt: timestamp
    
    transactions/
      {transactionId}/
        - description: string
        - amount: number
        - type: 'income' | 'expense' | 'transfer'
        - category: string
        - accountId: string
        - toAccountId: string (optional)
        - date: timestamp
        - notes: string (optional)
        - isSplit: boolean
        - createdAt: timestamp
        - updatedAt: timestamp
        
        splits/
          {splitId}/
            - accountId: string
            - accountName: string
            - amount: number
            - memo: string (optional)
            - type: 'debit' | 'credit'
    
    categories/
      {categoryId}/
        - name: string
        - type: 'income' | 'expense'
        - icon: string
        - color: string
```

---

## Development Phases

### Completed Phases ✅
1. **Foundation** - Project setup, Firebase, UI components
2. **Authentication** - Email/password, Google OAuth, verification
3. **User Initialization** - Profile creation, default data
4. **Account Management** - CRUD operations for accounts
5. **Transaction Management** - Income, expense, transfer, splits
6. **Profile Management** - Photo upload, name update
7. **Reports & Analytics** - Charts, statistics, filtering
8. **Dashboard** - Overview, recent activity
9. **UI/UX Refinement** - Responsive design, polish

### In Progress 🔄
10. **Testing & Bug Fixes** - Comprehensive testing

### Planned 📅
11. **Deployment** - Production deployment to Firebase Hosting

---

## Quick Links

### Diagram Files
- [Workflow Chart HTML](diagrams/workflow_chart.html)
- [DFD Level 0 HTML](diagrams/dfd_level_0.html)
- [DFD Level 1 HTML](diagrams/dfd_level_1.html)
- [DFD Level 2 (Transaction) HTML](diagrams/dfd_level_2_transaction.html)
- [Class Diagram HTML](diagrams/class_diagram.html)

### Project Files
- [Main README](../README.md)
- [Package.json](../package.json)
- [Source Code](../src/)

---

## Contact & Support

For questions or issues:
- Create an issue in the project repository
- Contact the development team
- Refer to inline code documentation

---

## License

This project is developed for educational and personal finance management purposes.

---

**Last Updated:** January 19, 2026  
**Document Version:** 1.0
