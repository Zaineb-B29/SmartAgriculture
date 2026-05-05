import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
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
  constructor(private http: HttpClient) {
    this.updateBodyClass();
  }

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

// ===== MESSAGES =====
getConversation(type1: string, id1: number, type2: string, id2: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/message/conversation?type1=${type1}&id1=${id1}&type2=${type2}&id2=${id2}`);
}

envoyerMessage(expType: string, expId: number, destType: string, destId: number, contenu: string): Observable<any> {
  const params = new HttpParams()
    .set('expediteurType', expType).set('expediteurId', expId)
    .set('destinataireType', destType).set('destinataireId', destId)
    .set('contenu', contenu);
  return this.http.post<any>(`${this.apiUrl}/message`, null, { params });
}

envoyerMessageFichier(expType: string, expId: number, destType: string, destId: number, file: File, contenu: string): Observable<any> {
  const fd = new FormData();
  fd.append('expediteurType', expType);
  fd.append('expediteurId', expId.toString());
  fd.append('destinataireType', destType);
  fd.append('destinataireId', destId.toString());
  fd.append('file', file);
  fd.append('contenu', contenu);
  return this.http.post<any>(`${this.apiUrl}/message/fichier`, fd);
}

marquerLus(readerType: string, readerId: number, otherType: string, otherId: number): Observable<void> {
  const params = new HttpParams()
    .set('readerType', readerType).set('readerId', readerId)
    .set('otherType', otherType).set('otherId', otherId);
  return this.http.patch<void>(`${this.apiUrl}/message/mark-read`, null, { params });
}

supprimerMessage(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/message/${id}`);
}

supprimerConversation(type1: string, id1: number, type2: string, id2: number): Observable<void> {
  return this.http.delete<void>(
    `${this.apiUrl}/message/conversation?type1=${type1}&id1=${id1}&type2=${type2}&id2=${id2}`
  );
}
getNouveauxMessages(myType: string, myId: number): Observable<number> {
  return this.http.get<number>(
    `${this.apiUrl}/message/unread-count?type=${myType}&id=${myId}`
  );
}
getUnreadMessages(myType: string, myId: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.apiUrl}/message/unread?type=${myType}&id=${myId}`
  );
}
  private _open = new BehaviorSubject<boolean>(window.innerWidth > 768);
  isOpen$ = this._open.asObservable();

  get isOpen(): boolean {
    return this._open.value;
  }

  toggle() {
    const newState = !this._open.value;
    this._open.next(newState);
    this.updateBodyClass();
  }

  open() {
    this._open.next(true);
    this.updateBodyClass();
  }

  close() {
    this._open.next(false);
    this.updateBodyClass();
  }

  private updateBodyClass() {
    if (this._open.value) {
      document.body.classList.remove('sidebar-main');
    } else {
      document.body.classList.add('sidebar-main');
    }
  }
}
