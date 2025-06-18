import {AfterViewInit, Component, effect, inject, ViewChild} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTableDataSource } from '@angular/material/table';
import {MatButtonModule } from '@angular/material/button';
import {MatCardModule } from '@angular/material/card';
import {ExpenseService } from '../service/expense.service';
import {Expense, Budget} from '../models/expense.models';
import {RouterModule, Router} from '@angular/router';


@Component({
  selector: 'app-expense-grid',
  standalone: true,
  imports: [MatButtonModule, MatCardModule,MatSnackBarModule, MatTableModule, MatPaginator, MatPaginatorModule, RouterModule],
  templateUrl: './expense-grid.component.html',
  styleUrls: ['./expense-grid.component.css']
})
export class ExpenseGridComponent implements AfterViewInit {
 
  expenseService= inject(ExpenseService);
  snackBar= inject(MatSnackBar);

  displayedColumns: string[] = ["index", "title","budgetId", "category","amount", "date", "actions", ];

  dataSource = new MatTableDataSource<Expense>([]);
  
  @ViewChild(MatPaginator) paginator!:MatPaginator ;
  
 
  totalItems: number = 0;
  pageSize: number = 15;


  expenses = this.expenseService.expenses; 
  router: Router = inject(Router);
  budgets = this.expenseService.budgets;
      
  
  constructor() {

    this.expenseService.getExpenses();
    this.expenseService.getBudgets();
    this.expenseService.getCategories();
    effect(() => {
      const expenses = this.expenses();
      this.dataSource.data = expenses;
      this.totalItems = expenses.length;
      this.expenseService.getBudgets();

      console.log('Data source updated:', this.dataSource.data);
      console.log('Total items:', this.totalItems);
      console.log('Page size:', this.pageSize);
    });

    if (this.paginator) {
      this.paginator.firstPage();
    }
        
  };

  getBudgetTitle(budgetId: number | null ): string {
    if (!budgetId) return 'No Budget';
    const budgets = this.expenseService.budgets();
    const budget = budgets.find(budget => Number(budget.id) === Number(budgetId));
    return budget ? budget.title : 'No Budget';
  }

  getCategoryTitle(categoryId: number | null): string {
    if (!categoryId) return 'No Category';
    const categories = this.expenseService.categories();
    const category = categories.find(cat => Number(cat.id) === Number(categoryId));
    return category ? category.name : 'No Category';
  }

  logExpenseId(id: number) {
    console.log('Expense ID:', id);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    console.log('Paginator assigned:', this.paginator);
  }

  onPageChange(event: any) {
    console.log('Page changed:', event);
    this.pageSize = event.pageSize;    
    console.log('Updated Pagesize:', this.pageSize);
  }
  
  deleteExpense(expenseID: number) {
    this.expenseService.deleteExpense(expenseID);
    this.snackBar.open("Expense Deleted", "OK", {duration: 2000});
  };

}    
    

