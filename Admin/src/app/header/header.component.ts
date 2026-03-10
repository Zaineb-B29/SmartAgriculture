import { Component } from '@angular/core';
import { CrudService } from '../service/crud.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
    isProfileOpen = false;
    isNotificationsOpen = false;

    toggleProfile(event: Event) {
      event.preventDefault();
      this.isProfileOpen = !this.isProfileOpen;
    }

    toggleNotifications(event: Event) {
      event.preventDefault();
      this.isNotificationsOpen = !this.isNotificationsOpen;
    }

    userDetails:any;
    constructor(private service: CrudService,private router:Router) { 
      this.userDetails = this.service.userDetails();
    }
    ngOnInit(): void {
      console.log(this.userDetails); }  
    logout() {
      localStorage.clear();
      sessionStorage.clear();
      this.router.navigate(['/']).then(() => {
        
        window.location.reload();
        setTimeout(() => {
          alert('Vous avez été déconnecté avec succès');
        }, 100);
      });
    }
}
