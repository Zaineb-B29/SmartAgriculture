import { Component } from '@angular/core';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  showLoginModal = false;

  constructor(private service: CrudService) {}

  get IsClientIn(): boolean {
    return this.service.isClientIn();
  }

  get IsFournisseurIn(): boolean {
    return this.service.isFournisseurIn();
  }

  get IsExpertIn(): boolean {
    return this.service.isExpertIn();
  }

  openLoginModal() {
    this.showLoginModal = true;
    document.body.style.overflow = 'hidden'; // bloque le scroll
  }

  closeLoginModal() {
    this.showLoginModal = false;
    document.body.style.overflow = '';
  }

  logout() {
    sessionStorage.clear();
    window.location.href = '/';
  }
}