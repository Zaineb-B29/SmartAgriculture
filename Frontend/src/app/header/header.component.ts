import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CrudService } from '../service/crud.service';
import { PrixProposer } from '../Entites/PrixProposer.Entites';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  showLoginModal = false;
  showNotifications = false;
  unreadContacts: PrixProposer[] = [];
  loading = false;
  private subscription!: Subscription;

  constructor(private service: CrudService, private router: Router) {}

  ngOnInit(): void {
    this.service.startPolling(5000);
    this.subscription = this.service.unreadContacts$.subscribe(contacts => {
      this.unreadContacts = contacts;
    });
  }

  ngOnDestroy(): void {
    this.service.stopPolling();
    this.subscription?.unsubscribe();
  }

  get unreadCount(): number {
    return this.unreadContacts.length;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(id: number): void {
    this.service.markAsRead(id).subscribe(() => {
      this.unreadContacts = this.unreadContacts.filter(c => c.id !== id);
      this.showNotifications = false;
      this.router.navigate(['/listPrixProposer']);
    });
  }

  markAllAsRead(): void {
    this.loading = true;
    this.service.markAllAsRead().subscribe({
      next: () => {
        this.unreadContacts = [];
        this.loading = false;
        this.showNotifications = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  get IsClientIn(): boolean { return this.service.isClientIn(); }
  get IsFournisseurIn(): boolean { return this.service.isFournisseurIn(); }
  get IsExpertIn(): boolean { return this.service.isExpertIn(); }

  openLoginModal(): void {
    this.showLoginModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
    document.body.style.overflow = '';
  }

  logout(): void {
    sessionStorage.clear();
    window.location.href = '/';
  }
}