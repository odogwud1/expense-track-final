import { Component, effect, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ExpenseService } from '../service/expense.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { Expense } from '../models/expense.models';

@Component({
  selector: 'app-expense-add-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    RouterModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './expense-add-edit.component.html',
  styleUrl: './expense-add-edit.component.css',
})
export class ExpenseAddEditComponent {
  expenseService = inject(ExpenseService);
  router = inject(Router);
  snackBar = inject(MatSnackBar);
  route = inject(ActivatedRoute);

  categories = [
    'Food',
    'Bills',
    'Housing',
    'Travel',
    'Leisure',
    'Health',
    'Transportation',
    'Shopping',
    'Education',
    'Pets',
  ];

  expenseForm: FormGroup;

  isEditMode = false;
  expenseID: number = 0;

  constructor(private fb: FormBuilder) {
    this.expenseForm = this.fb.group({
      title: ['', Validators.required],
      category: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0)]],
      date: ['', Validators.required],
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      console.log('ID from route: ', id);

      if (id) {
        this.isEditMode = true;
        this.expenseID = +id;
        this.expenseService.getExpenses();

        
      }
    });

    effect(() => {
      if (this.isEditMode) {
      const expenses = this.expenseService.expenses();
      console.log('Effect triggered. Expenses: ', expenses);
      if (expenses.length > 0) {
        this.loadExpenseData(this.expenseID, expenses);
      }
    }
    });
  }

  loadExpenseData(expenseID: number, expenses: Expense[]) {
    console.log('All expenses:', this.expenseService.expenses());
    console.log('Looking for ID:', expenseID);
    const expense = expenses.find((e) => Number(e.id) === Number(expenseID));
    console.log('Found expense:', expense);
    if (expense) {
      this.expenseForm.patchValue({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
      });
      console.log('Expense data loaded into form: ', this.expenseForm.value);
    }
  }

  generateNewId(): number {
    if (!this.expenseService.expenses().length) {
      return 1;
    }

    const lastId = Math.max(
      ...this.expenseService.expenses().map((expense) => expense.id)
    );
    return lastId + 1;
  }

  onSubmit() {
    console.log('Form Submitted');
    if (this.expenseForm.valid) {
      const expense: Expense = {
        ...this.expenseForm.value,
        id: this.expenseID || Date.now(),
      };

      if (this.isEditMode && this.expenseID !== null) {
        this.expenseService.updateExpense(this.expenseID, expense);
        this.snackBar.open('Expense edited successfully');
      } else {
        expense.id = this.generateNewId();
        this.expenseService.addExpense(expense);
        this.snackBar.open('Expense added successfully');
      }
      this.expenseForm.reset();

      this.router.navigate(['/dashboard']);
    }
  }

  onClear() {
    this.expenseForm.reset();
    console.log('Cleared');
  }

  onCancel() {
    this.router.navigate(['/dashboard']);
    console.log('Cancelled');
  }
}
