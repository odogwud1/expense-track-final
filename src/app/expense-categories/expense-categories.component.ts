import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ExpenseService } from '../service/expense.service';

@Component({
  selector: 'app-expense-categories',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    CommonModule,
    RouterModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './expense-categories.component.html',
  styleUrl: './expense-categories.component.css',
})
export class ExpenseCategoriesComponent {
  router = inject(Router);
  fb = inject(FormBuilder);
  expenseService = inject(ExpenseService);
  snackBar = inject(MatSnackBar);
  displayedColumns: string[] = ['category', 'actions'];

  expenseForm = this.fb.group({
    category: ['', Validators.required],
  });
  constructor() { }

  get categories() {
    return this.expenseService.categories;
  }

  onSubmit() {
    const newCategory = this.expenseForm.value.category;
    if (
      this.expenseForm.valid &&
      typeof newCategory === 'string' &&
      newCategory.trim()
    ) {
      this.expenseService.addCategory(newCategory.trim());
      this.expenseForm.reset();
      this.snackBar.open('New category added', 'OK', { duration: 2000 });
    } else {
      this.snackBar.open('Form is invalid', 'OK', { duration: 2000 });
    }
  }

  deleteCategory(category: {id:number; name:string}) {
    this.expenseService.getExpensesRaw().subscribe((expenses) => {
      const isUsed = expenses.some((exp) => exp.category === category.name);
      if (isUsed) {
        this.snackBar.open(
          'Cannot delete: Category is used in expenses',
          'OK',
          { duration: 3000 }
        );
      } else {
        this.expenseService.deleteCategory(category);
        this.snackBar.open('Category Deleted', 'OK', { duration: 2000 });
      }
    });
  }
}
