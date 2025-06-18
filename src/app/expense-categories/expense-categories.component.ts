import { Component, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ExpenseService } from '../service/expense.service';
import { Category } from '../models/expense.models';

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
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './expense-categories.component.html',
  styleUrl: './expense-categories.component.css',
})
export class ExpenseCategoriesComponent implements OnInit {
  router = inject(Router);
  expenseService = inject(ExpenseService);
  snackBar = inject(MatSnackBar);
  fb = inject(FormBuilder);

  mode: 'list' | 'add' = 'list';

  dataSource = new MatTableDataSource<Category>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = ['index', 'category', 'description', 'actions'];

  newCategory: Category = {
    id: 0,
    name: '',
    description: '',
  };

  get categories() {
    return this.expenseService.categories;
  }

  constructor() {
    this.expenseService.getCategories();
    effect(() => {
      const categories = this.categories();
      this.dataSource.data = categories;
      console.log('Categories updated:', categories);
    });

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  ngOnInit() {
    this.loadCategories();
  }

  private validateCategory(): boolean {
    return (
      this.newCategory.name.trim() !== '' &&
      this.newCategory.description.trim() !== ''
    );
  }

  showAddCategory() {
    this.mode = 'add';
  }

  showCategoryList() {
    this.mode = 'list';
    this.loadCategories();
  }

  loadCategories() {
    this.expenseService.getCategories();
  }

  generateNewId(): number {
    const categories = this.expenseService.categories();
    if (!categories.length) {
      return 1;
    }

    const lastId = Math.max(
      ...categories.map((category) => Number(category.id))
    );
    return lastId + 1;
  }

  onSubmit() {
    if (this.validateCategory()) {
      const categoryToAdd = {
        id: this.generateNewId(),
        name: this.newCategory.name,
        description: this.newCategory.description,
      };

      this.expenseService.addCategory(categoryToAdd);
      this.snackBar.open('Category added successfully', 'Close', {
        duration: 2000,
      });
      this.showCategoryList();
    }
  }

  deleteCategory(category: Category) {
    this.expenseService.getExpensesRaw().subscribe((expenses) => {
      const isUsed = expenses.some((exp) => exp.categoryId === category.id);
      if (isUsed) {
        this.snackBar.open(
          'Cannot delete: Category is used in expenses',
          'OK',
          { duration: 3000 }
        );
      } else {
        this.expenseService.deleteCategory(category.id);
        this.loadCategories();
        this.snackBar.open('Category Deleted', 'OK', { duration: 2000 });
      }
    });
  }
}
