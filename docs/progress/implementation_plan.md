# Phase 2B: Double-Entry Accounting Implementation Plan

## Goal Description
Refactor the transaction system to use a GnuCash-style Double-Entry Accounting model. This involves removing the simple "income/expense" types and replacing them with a "Splits" system where every transaction must balance (Credits = Debits). This ensures accurate financial tracking and professional accounting standards.

## User Review Required
> [!WARNING]
> This is a **BREAKING CHANGE** to the data model.
> - `TransactionType` enum ("income", "expense", "transfer") will be removed.
> - `Transaction` interface will now rely on `Split[]` instead of `amount` and `type`.
> - Existing transactions in Firestore will need migration (a migration script will be provided later, but for development, data might look broken until migrated).

## Proposed Changes

### Core Data Models
#### [MODIFY] [firebaseTypes.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/finance-joshi/src/lib/firebaseTypes.ts)
- Remove `TransactionType` from `Transaction` interface.
- Ensure `Split` interface is robust (already exists, but needs review).
- Add `Transaction` validation logic (sum of splits must be 0).

### Database Layer
#### [MODIFY] [DatabaseService.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/finance-joshi/src/lib/database/DatabaseService.ts)
- Update `createTransaction` to handle splits validation.
- Update `updateTransaction` to handle split updates.

### UI Components (Transaction Dialog)
#### [MODIFY] [QuickTransactionDialog.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/finance-joshi/src/components/QuickTransactionDialog.tsx)
- Redesign form to support "From Account" and "To Account" (simplified double-entry for normal users).
- For advanced mode, allow adding multiple splits.
- Remove simple "Income/Expense" toggle and replace with account selection logic (e.g., Selecting "Income Category" as source -> Income).

### Transaction List Visualization
#### [MODIFY] [TransactionItem.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/finance-joshi/src/components/TransactionItem.tsx) (or equivalent list component)
- Update to calculate "Amount" based on the context of the viewed account (e.g., if viewing Bank, and split is -100, show -100).
