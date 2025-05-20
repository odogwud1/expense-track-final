import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, Routes} from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule} from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ 
   CommonModule,RouterModule, RouterOutlet, MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule
  ],
  templateUrl:'./app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'expense-tracker';
}