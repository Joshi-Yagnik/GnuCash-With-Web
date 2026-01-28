# Finance Web With GnuCash Import Project Diagrams

This folder contains the complete architectural documentation for the Finance Web With GnuCash Import project. All diagrams are rendered using Mermaid.js and are viewable in any modern web browser.

**[👉 OPEN INTERACTIVE INDEX (index.html)](index.html)**

---

## 📁 Diagram Index

### 🏠 Landing Page
- **[index.html](index.html)**: Interactive landing page with visual cards linking to all diagrams. Start here!

### 🔄 Project Workflows
- **[workflow_chart.html](workflow_chart.html)**: The complete master workflow of the entire system.
- **[workflow_auth.html](workflow_auth.html)**: Dedicated authentication, signup, and initialization flow.
- **[workflow_main.html](workflow_main.html)**: Main application flow post-login (Dashboard & Features).
  - **[workflow_core.html](workflow_core.html)**: Daily Operations (Transactions, Accounts, Search).
  - **[workflow_management.html](workflow_management.html)**: Management (Books, Budgets, Recurring, Structure).
  - **[workflow_analysis.html](workflow_analysis.html)**: Analysis (Reports, Settings, Import/Export).

### 🏗️ Architecture & Database
- **[er_diagram.html](er_diagram.html)**: Entity-Relationship diagram showing the 12+ Firestore collections and schema.
- **[class_diagram.html](class_diagram.html)**: UML Class diagram showing TypeScript interfaces and relationships.
- **DFD Series**: [Level 0](dfd_level_0.html) (Context), [Level 1](dfd_level_1.html) (System), [Level 2](dfd_level_2_transaction.html) (Transaction CRUD).

### 🔀 Sequence Diagrams (Detailed Flows)
- **[sequence_auth.html](sequence_auth.html)**: User Login > Init Profile > Create Default Book > Load Dashboard.
- **[sequence_transaction.html](sequence_transaction.html)**: Add Transaction > Validate > Create Splits > Update Accounts > Log Activity.
- **[sequence_budget.html](sequence_budget.html)**: Create Budget > Track Spending > Real-time Alerts > Edit/Delete.
- **[sequence_multibook.html](sequence_multibook.html)**: Create Book > Switch Book Context > Share Book via Invite.

---

## 🖼️ How to Save Diagrams as Images

### Recommended: Browser Screenshot (High Quality)
1. Open the `.html` file in **Chrome** or **Edge**.
2. Press **F12** to open Developer Tools.
3. Press **Ctrl + Shift + P** (Windows) or **Cmd + Shift + P** (Mac).
4. Type "screenshot".
5. Select **"Capture full size screenshot"**.
6. The high-res image will download automatically.

---

## 📐 Diagram Types Explained

### Workflow Charts
Used to visualize user journeys and page navigation.
- **Purpose:** Onboarding, understanding feature scope.
- **Updated:** Split into focused diagrams for better readability.

### Entity-Relationship (ER) Diagram
Used to visualize the Firestore NoSQL database structure.
- **Shows:** Collections, documents, fields, data types, and references.

### Sequence Diagrams
Used to visualize specific logical processes over time.
- **Shows:** Interactions between User, UI Components, App Logic, Firestore, and External Services.

### Class Diagram
Used to visualize the Codebase / TypeScript architecture.
- **Shows:** Interfaces, types, properties, and methods.

---

## 🔗 Related Documentation
- [Main Project README](../README.md)
- [Source Code](../../src/)

---

**Last Updated:** January 28, 2026 |  Version 2.0
