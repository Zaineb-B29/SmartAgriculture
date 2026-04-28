import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-admin-messages',
  templateUrl: './admin-messages.component.html',
  styleUrls: ['./admin-messages.component.css']
})
export class AdminMessagesComponent implements OnInit {

  allUsers: any[] = [];
  filteredList: any[] = [];
  adminId = 0;

  filterType = 'ALL';
  searchBy = 'email';
  searchValue = '';

  constructor(private service: CrudService, private router: Router) {}

  ngOnInit() {
    const details = this.service.userDetails();
    this.adminId = details?.id || 1;
    this.service.getClients().subscribe(clients => {
    const tagged = clients.map((c: any) => ({ ...c, _type: 'CLIENT' }));
    this.allUsers = [...this.allUsers, ...tagged];
    this.applyFilter();
  });
  this.service.getExperts().subscribe(experts => {
    const tagged = experts.map((e: any) => ({ ...e, _type: 'EXPERT' }));
    this.allUsers = [...this.allUsers, ...tagged];
    this.applyFilter();
  });
  this.service.getFournisseurs().subscribe(fournisseurs => {
    const tagged = fournisseurs.map((f: any) => ({ ...f, _type: 'FOURNISSEUR' }));
    this.allUsers = [...this.allUsers, ...tagged];
    this.applyFilter();
  });
  }

  onFilterChange() {
    this.searchValue = '';
    this.applyFilter();
  }

  applyFilter() {
    let list = [...this.allUsers];

    // Filtre par type
    if (this.filterType !== 'ALL') {
      list = list.filter(u => u._type === this.filterType);
    }

    // Filtre par valeur
    if (this.searchValue.trim()) {
      const val = this.searchValue.trim().toLowerCase();
      if (this.searchBy === 'email') {
        list = list.filter(u => u.email?.toLowerCase().includes(val));
      } else {
        list = list.filter(u => u.id?.toString() === val);
      }
    }

    this.filteredList = list;
  }

  resetFilter() {
    this.filterType = 'ALL';
    this.searchBy = 'email';
    this.searchValue = '';
    this.applyFilter();
  }

  ouvrirChat(userType: string, userId: number) {
    this.router.navigate(['/message'], {
      queryParams: {
        myType: 'ADMIN',
        myId: this.adminId,
        otherType: userType,
        otherId: userId
      }
    });
  }
}