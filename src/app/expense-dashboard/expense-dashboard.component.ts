import { Component, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ExpenseService } from '../service/expense.service';
import { Expense } from '../models/expense.models';
import { catchError, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-expense-dashboard',
  imports: [MatTooltipModule,RouterModule,MatCardModule, MatTableModule, CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './expense-dashboard.component.html',
  styleUrls: ['./expense-dashboard.component.css']
})
export class ExpenseDashboardComponent {

  expenseService = inject(ExpenseService);
  router = inject(Router);
  dataSource = new MatTableDataSource<Expense>([]);

  totalAmount: number = 0;
  totalItems: number = 0;
  totalCategories: number = 10;
  expenses = this.expenseService.expenses;

  constructor() {

    this.expenseService.getExpenses();
    
    effect(() => {
      const expenses = this.expenses();
      this.dataSource.data = expenses;
      this.totalItems = expenses.length;
      const categories = new Set(expenses.map(e => e.categoryId));
      this.totalCategories = categories.size;
      this.totalAmount = expenses.reduce((sum, expense) => {
        const amount = Number(expense.amount);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

      console.log('Data source updated:', this.dataSource.data);
      console.log('Total items:', this.totalItems);
      console.log('Total categories:', this.totalCategories);
      console.log('Total amount:', this.totalAmount);
    });
  }

  
  navigatetoCategories(){
    this.router.navigate(['/categories']);
  }

  navigateToExpenses() {
    this.router.navigate(['/expense-list']);
  }

  navigateToBudgets() {
    this.router.navigate(['/budget']);  
  }

}
