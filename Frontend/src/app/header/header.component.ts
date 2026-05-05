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
  showProfileMenu = false;
  unreadContacts: PrixProposer[] = [];
  loading = false;
  userData: any = null;
  userType: string | null = null;
  private subscriptions: Subscription[] = [];

  constructor(private service: CrudService, private router: Router) {}

  ngOnInit(): void {
    this.refreshUserInfo();
    this.service.startPolling(5000);
    this.subscriptions.push(
      this.service.unreadContacts$.subscribe(contacts => {
        this.unreadContacts = contacts;
      })
    );
    this.subscriptions.push(
      this.router.events.subscribe(() => this.refreshUserInfo())
    );
  }

  ngOnDestroy(): void {
    this.service.stopPolling();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  get unreadCount(): number {
    return this.unreadContacts.length;
  }

  get userDisplayName(): string {
    if (!this.userData) return 'Utilisateur';
    const first = this.userData.prenom || '';
    const last = this.userData.nom || '';
    const fullName = `${first} ${last}`.trim();
    return fullName || this.userData.email || 'Utilisateur';
  }

  get userInitials(): string {
    if (!this.userData) return '';
    const names = `${this.userData.prenom || ''} ${this.userData.nom || ''}`.trim().split(' ').filter(Boolean);
    const initials = names.slice(0, 2).map(part => part[0].toUpperCase()).join('');
    return initials || (this.userData.email ? this.userData.email.charAt(0).toUpperCase() : 'U');
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  closeProfileMenu(): void {
    this.showProfileMenu = false;
  }

  refreshUserInfo(): void {
    this.userData = this.service.userDetails();
    this.userType = this.service.getCurrentUserType();
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
    this.closeProfileMenu();
    document.body.style.overflow = 'hidden';
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
    document.body.style.overflow = '';
  }
  contactAdmin() {
    const type  = sessionStorage.getItem('type');
    const token = sessionStorage.getItem('myTokenClient')
              || sessionStorage.getItem('myTokenExpert')
              || sessionStorage.getItem('myTokenFournisseur');

    if (!type || !token) {
      this.openLoginModal();
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId  = payload.data?.id;

      this.router.navigate(['/message'], {
        queryParams: {
          myType:    type,
          myId:      userId,
          otherType: 'ADMIN',
          otherId:   3  // ← change 1 par 3
        }
      });
    } catch {
      this.openLoginModal();
    }
  }
  
  logout(): void {
    sessionStorage.clear();
    window.location.href = '/';
  }

  
}