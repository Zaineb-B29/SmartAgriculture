import { Component } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {

  toggleSidebar() {
    document.body.classList.toggle('sidebar-main');
  }

  
}