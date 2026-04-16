import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Client } from '../Entites/Client.Entites';
import { ExpertAgricole } from '../Entites/ExpertAgricole.Entites';
import { Fournisseur } from '../Entites/Fournisseur.Entites';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Contact } from '../Entites/Contact.Entites';
import { Besoin } from '../Entites/Besoin.Entites';
import { PrixProposer } from '../Entites/PrixProposer.Entites';

@Injectable({
  providedIn: 'root'
})
export class CrudService {
  helper = new JwtHelperService();
  apiUrl = 'http://localhost:8081/api';
  loginClienturl = `${this.apiUrl}/client/login`;
  loginExperturl = `${this.apiUrl}/expertAgricole/login`;
  loginFournisseururl = `${this.apiUrl}/fournisseur/login`;
  contactUrl = `${this.apiUrl}/contact`;
  GoogleUrl = 'http://localhost:8081/api/client/login-google';
  fastApiUrl = "http://127.0.0.1:8081";

  constructor(private http: HttpClient) {}

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

  /* ================= GOOGLE LOGIN ================= */
  signInWithGoogle(idToken: string): Observable<any> {
    const params = new HttpParams().set('id_token', idToken);
    return this.http.post(this.GoogleUrl, null, { params });
  }

  /* ================= BESOIN ================= */
  improveDescription(descriptionData: any): Observable<any> {
    return this.http.post(`${this.fastApiUrl}/improve-description`, descriptionData);
  }

  createBesoin(clientId: number, besoin: Besoin): Observable<Besoin> {
    return this.http.post<Besoin>(`${this.apiUrl}/client/${clientId}`, besoin);
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

  addBesoin(clientId: number, request: FormData) {
    return this.http.post(`${this.apiUrl}/besoin/client/${clientId}`, request);
  }

  /* ================= USER DETAILS & AUTH ================= */
  userDetails() {
    let token: any =
      sessionStorage.getItem('myTokenClient') ||      // ✅
      sessionStorage.getItem('myTokenFournisseur') || // ✅
      sessionStorage.getItem('myTokenExpert');        // ✅

    if (!token) return null;

    let decodeToken = this.helper.decodeToken(token);
    return decodeToken.data;
  }

  isLoggedIn() {
    let token = sessionStorage.getItem("myToken"); // ✅
    return !!token;
  }

  isFournisseurIn() {
    let token = sessionStorage.getItem("myTokenFournisseur"); // ✅
    return !!token;
  }

  isExpertIn() {
    let token = sessionStorage.getItem("myTokenExpert"); // ✅
    return !!token;
  }

  isClientIn() {
    let token = sessionStorage.getItem("myTokenClient"); // ✅
    return !!token;
  }

  /* ================= PRIX PROPOSÉ ================= */
  proposerPrix(fournisseurId: number, besoinId: number, prix: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/prixproposer/fournisseur/${fournisseurId}/besoin/${besoinId}`,
      prix,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  getMesBesoins(): Observable<Besoin[]> {
    const user = this.userDetails();
    return this.http.get<Besoin[]>(`${this.apiUrl}/besoin/client/${user.id}`);
  }

  getPrixByBesoin(besoinId: number): Observable<PrixProposer[]> {
    return this.http.get<PrixProposer[]>(`${this.apiUrl}/prixproposer/besoin/${besoinId}`);
  }

  getMesPropositions(): Observable<PrixProposer[]> {
    const token = sessionStorage.getItem('myTokenFournisseur'); // ✅
    if (!token) return of([]);
    const payload = JSON.parse(atob(token.split('.')[1]));
    const fournisseurId = payload.data.id;
    return this.http.get<PrixProposer[]>(`${this.apiUrl}/prixproposer/fournisseur/${fournisseurId}`);
  }

  reserver(clientId: number, prixProposerId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/reserver/client/${clientId}/prixproposer/${prixProposerId}`,
      {}
    );
  }

  getMesReservations(clientId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reserver/client/${clientId}`);
  }

  verifyBesoin(besoinId: number, descriptionExpert: string) {
    const user = this.userDetails();
    return this.http.put(
      `${this.apiUrl}/besoin/verify/${besoinId}/expert/${user.id}`,
      { descriptionExpert }
    );
  }
  /*for THE VALDATED BESOINS(pour fournisseur)*/ 
  getBesoinsValides(): Observable<Besoin[]> {
    return this.http.get<Besoin[]>(`${this.apiUrl}/besoin/valide`);
  }
}