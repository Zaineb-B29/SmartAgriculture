import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from '../service/crud.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  isNotificationsOpen = false;
  isProfileOpen = false;
  unreadMessages: any[] = [];
  adminId = 0;
  userDetails: any = {};
  private pollSub!: Subscription;

  constructor(private service: CrudService, private router: Router) {}

  ngOnInit() {
    const token = localStorage.getItem('myToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userDetails = payload.data || {};
        this.adminId = payload.data?.id || 1;
        console.log('adminId dans header:', this.adminId);
      } catch {}
    }

    // Polling toutes les 5 secondes
    this.pollSub = interval(5000).pipe(
      switchMap(() => this.service.getUnreadMessages('ADMIN', this.adminId))
    ).subscribe({
      next: (msgs) => this.unreadMessages = msgs,
      error: () => {}
    });

    this.service.getUnreadMessages('ADMIN', this.adminId).subscribe({
    next: (msgs) => {
      console.log('unread messages:', msgs);
      this.unreadMessages = msgs;
    },
    error: (err) => console.log('erreur unread:', err)
  });
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
  }

  get unreadCount(): number {
    return this.unreadMessages.length;
  }

  toggleNotifications(event: Event) {
    event.preventDefault();
    this.isNotificationsOpen = !this.isNotificationsOpen;
    this.isProfileOpen = false;
  }

  toggleProfile(event: Event) {
    event.preventDefault();
    this.isProfileOpen = !this.isProfileOpen;
    this.isNotificationsOpen = false;
  }

  ouvrirMessage(msg: any) {
    this.isNotificationsOpen = false;
    this.router.navigate(['/message'], {
      queryParams: {
        myType: 'ADMIN',
        myId: this.adminId,
        otherType: msg.expediteurType,
        otherId: msg.expediteurId
      }
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}