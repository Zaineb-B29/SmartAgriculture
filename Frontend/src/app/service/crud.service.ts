import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Client } from '../Entites/Client.Entites';
import { ExpertAgricole } from '../Entites/ExpertAgricole.Entites';
import { Fournisseur } from '../Entites/Fournisseur.Entites';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Contact } from '../Entites/Contact.Entites';
import { Besoin } from '../Entites/Besoin.Entites';
@Injectable({
  providedIn: 'root'
})
export class CrudService {
  helper=new JwtHelperService();
  apiUrl = 'http://localhost:8081/api';
  loginClienturl = `${this.apiUrl}/client/login`;
  loginExperturl = `${this.apiUrl}/expertAgricole/login`;
  loginFournisseururl = `${this.apiUrl}/fournisseur/login`;
  contactUrl = `${this.apiUrl}/contact`;
  GoogleUrl = 'http://localhost:8081/api/client/login-google';

constructor(private http: HttpClient) { }
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


/* LOGIN CLIENT */
  loginClient(client: Client) {
    return this.http.post<any>(this.loginClienturl, client);
  }

/* LOGIN EXPERT */
  loginExpert(expert: ExpertAgricole) {
    return this.http.post<any>(this.loginExperturl, expert);
  }

/* LOGIN FOURNISSEUR */
  loginFournisseur(fournisseur: Fournisseur) {
    return this.http.post<any>(this.loginFournisseururl, fournisseur);
  }

/* ================= CONTACT ================= */

  addContact(contact: Contact): Observable<any> {
    return this.http.post<any>(this.contactUrl, contact);
  }

  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.contactUrl);
  }

  getContactById(id: number): Observable<Contact> {
    return this.http.get<Contact>(`${this.contactUrl}/${id}`);
  }

  deleteContact(id: number): Observable<any> {
    return this.http.delete(`${this.contactUrl}/${id}`);
  }


/* ================= login Client ================= */
  signInWithGoogle(idToken: string): Observable<any> {
    const params = new HttpParams().set('id_token', idToken);
    return this.http.post(this.GoogleUrl, null, { params });
  }

/* ================= BESOIN ================= */
addBesoin(clientId: number, besoin: Besoin): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/besoin/client/${clientId}`, besoin);
}

getBesoins(): Observable<Besoin[]> {
  return this.http.get<Besoin[]>(`${this.apiUrl}/besoin`);
}

getBesoinById(id: number): Observable<Besoin> {
  return this.http.get<Besoin>(`${this.apiUrl}/besoin/${id}`);
}

deleteBesoin(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/besoin/${id}`);
}
}
