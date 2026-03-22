import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Admin } from '../Entites/Admin.Entites';
import { Client } from '../Entites/Client.Entites';
import { Fournisseur } from '../Entites/Fournisseur.Entites';
import { ExpertAgricole } from '../Entites/ExpertAgricole.Entites';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Contact } from '../Entites/Contact.Entites';


@Injectable({
  providedIn: 'root'
})
export class CrudService {
  helper=new JwtHelperService();

  apiUrl = 'http://localhost:8081/api';
  loginAdminurl = 'http://localhost:8081/api/admin/login';
  contactUrl = `${this.apiUrl}/contact`;
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

  userDetails(){
    let token:any=localStorage.getItem('myToken'); 
    let decodeToken= this.helper.decodeToken(token); 
     return decodeToken.data; 
   }

   isLoggedIn(){

    let token = localStorage.getItem("myToken");

    if (token) {
      return true ;
    } else {
      return false;
    }
  }
/* ================= Modifier ADMIN ================= */
  updateAdmin(id:number,admin: Admin) {
      const url = `${this.apiUrl+"/admin"}/${id}`
      return this.http.put<any>(url,admin);
    }
  findAdminById(id : number): Observable<Admin> {
      const url = `${this.apiUrl + "/admin"}/${id}`;
      return this.http.get<Admin>(url)
    }

/* ================= Modifier CLIENT ================= */
  updateClient(id:number,client: Client) {
    const url = `${this.apiUrl+"/client"}/${id}`
    return this.http.put<any>(url,client);
  }
  findClientById(id : number): Observable<Client> {
    const url = `${this.apiUrl + "/client"}/${id}`;
    return this.http.get<Client>(url)
  }
/* ================= Modifier Expert ================= */
  updateEtatExpert(id:number,expert: ExpertAgricole) {
    const url = `${this.apiUrl+"/expertAgricole/updateEtat"}/${id}`
    return this.http.put<any>(url,expert);
  }
  findExpertById(id : number): Observable<ExpertAgricole> {
    const url = `${this.apiUrl + "/expertAgricole"}/${id}`;
    return this.http.get<ExpertAgricole>(url)
  }

  /* ================= Modifier Fournisseur ================= */
  updateFournisseur(id:number,fournisseur: Fournisseur) {
    const url = `${this.apiUrl+"/fournisseur"}/${id}`
    return this.http.put<any>(url,fournisseur);
  }
  findFournisseurById(id : number): Observable<Fournisseur> {
    const url = `${this.apiUrl + "/fournisseur"}/${id}`;
    return this.http.get<Fournisseur>(url)  
  }
  /* ================= view contacts ================= */
  getContacts(): Observable<Contact[]> {
  return this.http.get<Contact[]>(this.contactUrl);
}
}
