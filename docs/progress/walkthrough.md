# Phase 2B: Double-Entry Accounting Walkthrough

## Overview
We have successfully transitioned the application from a simple single-entry system to a professional GnuCash-style double-entry accounting system. This ensures that every transaction is balanced (Credits = Debits) and accurately reflects the flow of money.

## Changes Made

### 1. Data Model Updates
- **Transactions**: Removed the `type` field (Income/Expense). Transactions are now defined solely by their `splits`.
- **Splits**: Enforced that the sum of all splits in a transaction must be zero.
- **Category Support**: Updated backend logic to treat Categories as "Accounts" (Income/Expense types) for the purpose of creating balanced transactions.

### 2. UI Refactoring
- **Quick Transaction Dialog**: completely redesigned to support Explicit Source and Destination selection.
    - **Income**: Flow from `Source (Category)` to `Destination (Asset)`.
    - **Expense**: Flow from `Source (Asset)` to `Destination (Category)`.
    - **Transfer**: Flow from `Source (Asset)` to `Destination (Asset)`.
- **Transaction List**: Updated to display amounts correctly based on the double-entry logic (e.g., green for money entering an account, red for money leaving).

### 3. Verification
- Verified that creating a transaction correctly updates the balances of *both* involved accounts.
- Verified that "Income" and "Expense" categories are correctly linked in the transaction splits.

## How to Test
1.  **Open Quick Transaction** (`Ctrl+K` or "Add Transaction").
2.  Select **Type**: 'Expense'.
3.  **Source**: Select "Bank Account".
4.  **Destination**: Select "Groceries" (Category).
5.  **Save**.
6.  **Verify**:
    - Bank Account balance decreases.
    - Groceries spending increases (visible in reports).
    - Transaction appears in both lists.

## Next Steps
- Implement full multi-split editing in `EditTransactionDialog`.
- Add a migration script for old single-entry transactions.
