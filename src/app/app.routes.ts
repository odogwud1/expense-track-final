import { AppComponent } from './app.component';
import { Routes } from '@angular/router';
import { ExpenseAddEditComponent } from './expense-add-edit/expense-add-edit.component';
import { ExpenseGridComponent } from './expense-grid/expense-grid.component';
import { ExpenseDashboardComponent } from './expense-dashboard/expense-dashboard.component';
import { ExpenseCategoriesComponent } from './expense-categories/expense-categories.component';
import { ExpenseBudgetComponent } from './expense-budget/expense-budget.component';


export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: ExpenseDashboardComponent },
  { path: 'add-expense', component: ExpenseAddEditComponent },
  { path: 'categories', component: ExpenseCategoriesComponent },
  { path: 'expense-list', component: ExpenseGridComponent },
  { path: 'budget', component: ExpenseBudgetComponent },
  { path: 'editExpense/:id', component: ExpenseAddEditComponent },
  { path: 'budget', component: ExpenseBudgetComponent },

  { path: '**', redirectTo: 'dashboard' },
];
