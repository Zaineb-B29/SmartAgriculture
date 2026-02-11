import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Admin } from '../Entites/Admin.Entites';
import { Client } from '../Entites/Client.Entites';
import { Fournisseur } from '../Entites/Fournisseur.Entites';
import { ExpertAgricole } from '../Entites/ExpertAgricole.Entites';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  apiUrl = 'http://localhost:8081/api';
  loginAdminurl = 'http://localhost:8081/api/admin/login';
  constructor(private http: HttpClient) {}

  // ===== ADMIN =====
  addadmin(admin: Admin): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin`, admin);
  }

  getAdmin(): Observable<Admin[]> {
    return this.http.get<Admin[]>(`${this.apiUrl}/admin`);
  }

  onDeleteAdmin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/${id}`);
  }

  // ===== CLIENT =====
  addclient(client: Client): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/client`, client);
  }

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/client`);
  }

  onDeleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/client/${id}`);
  }

  /* ================= EXPERT AGRICOLE ================= */

addExpert(expert: ExpertAgricole) {
  return this.http.post<any>(`${this.apiUrl}/expertAgricole`, expert);
}

getExperts() {
  return this.http.get<ExpertAgricole[]>(`${this.apiUrl}/expertAgricole`);
}

deleteExpert(id: number) {
  return this.http.delete(`${this.apiUrl}/expertAgricole/${id}`);
}

/* ================= FOURNISSEUR ================= */

addFournisseur(fournisseur: Fournisseur) {
  return this.http.post<any>(`${this.apiUrl}/fournisseur`, fournisseur);
}

getFournisseurs() {
  return this.http.get<Fournisseur[]>(`${this.apiUrl}/fournisseur`);
}

deleteFournisseur(id: number) {
  return this.http.delete(`${this.apiUrl}/fournisseur/${id}`);
}

/*login admin*/
loginAdmin(admin:Admin){
  return this.http.post<any>(this.loginAdminurl, admin);
}
}
