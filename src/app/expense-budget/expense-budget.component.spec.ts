import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseBudgetComponent } from './expense-budget.component';

describe('ExpenseBudgetComponent', () => {
  let component: ExpenseBudgetComponent;
  let fixture: ComponentFixture<ExpenseBudgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseBudgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
