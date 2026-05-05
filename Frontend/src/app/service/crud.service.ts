import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable, of, Subscription, switchMap } from 'rxjs';
import { Client } from '../Entites/Client.Entites';
import { ExpertAgricole } from '../Entites/ExpertAgricole.Entites';
import { Fournisseur } from '../Entites/Fournisseur.Entites';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Besoin } from '../Entites/Besoin.Entites';
import { PrixProposer } from '../Entites/PrixProposer.Entites';
import { Router } from '@angular/router';
import { Message } from '../Entites/Message.Entites';
import { Suivi } from '../Entites/Suivi.Entites';

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
  router: Router;

  constructor(private http: HttpClient, private _router: Router) {
    this.router = _router;
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

//MESSAGE
    // GET conversation between two actors
    getConversation(type1: string, id1: number, type2: string, id2: number): Observable<Message[]> {
      return this.http.get<Message[]>(
        `${this.apiUrl}/message/conversation?type1=${type1}&id1=${id1}&type2=${type2}&id2=${id2}`
      );
    }

    // POST text message
    envoyerMessage(expType: string, expId: number, destType: string, destId: number, contenu: string): Observable<Message> {
      const params = new HttpParams()
        .set('expediteurType', expType).set('expediteurId', expId)
        .set('destinataireType', destType).set('destinataireId', destId)
        .set('contenu', contenu);
      return this.http.post<Message>(`${this.apiUrl}/message`, null, { params });
    }

    // POST file message
    envoyerMessageFichier(expType: string, expId: number, destType: string, destId: number, file: File, contenu: string): Observable<Message> {
      const fd = new FormData();
      fd.append('expediteurType', expType);
      fd.append('expediteurId', expId.toString());
      fd.append('destinataireType', destType);
      fd.append('destinataireId', destId.toString());
      fd.append('file', file);
      fd.append('contenu', contenu);
      return this.http.post<Message>(`${this.apiUrl}/message/fichier`, fd);
    }

    // PATCH mark as read
    marquerLus(readerType: string, readerId: number, otherType: string, otherId: number): Observable<void> {
      const params = new HttpParams()
        .set('readerType', readerType).set('readerId', readerId)
        .set('otherType', otherType).set('otherId', otherId);
      return this.http.patch<void>(`${this.apiUrl}/message/mark-read`, null, { params });
    }

    // DELETE single message
    supprimerMessage(id: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/message/${id}`);
    }

    // DELETE full conversation (add a new backend endpoint for this)
    supprimerConversation(type1: string, id1: number, type2: string, id2: number): Observable<void> {
      return this.http.delete<void>(
        `${this.apiUrl}/message/conversation?type1=${type1}&id1=${id1}&type2=${type2}&id2=${id2}`
      );
    }

  /* ================= GOOGLE LOGIN ================= */
  signInWithGoogle(idToken: string): Observable<any> {
    const params = new HttpParams().set('id_token', idToken);
    return this.http.post(this.GoogleUrl, null, { params });
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

  getCurrentUserType(): string | null {
    return sessionStorage.getItem('type');
  }

  updateClient(client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/client/${client.id}`, client);
  }

  updateExpert(expert: ExpertAgricole): Observable<ExpertAgricole> {
    return this.http.put<ExpertAgricole>(`${this.apiUrl}/expertAgricole/${expert.id}`, expert);
  }

  updateFournisseur(fournisseur: Fournisseur): Observable<Fournisseur> {
    return this.http.put<Fournisseur>(`${this.apiUrl}/fournisseur/${fournisseur.id}`, fournisseur);
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

addBesoin(clientId: number, request: FormData) {
  return this.http.post(`${this.apiUrl}/besoin/client/${clientId}`, request);
}

getMesBesoins(): Observable<Besoin[]> {
  const user = this.userDetails();
  return this.http.get<Besoin[]>(`${this.apiUrl}/besoin/client/${user.id}`);
}

getBesoinsValides(): Observable<Besoin[]> {
  return this.http.get<Besoin[]>(`${this.apiUrl}/besoin/valide`);
}

getBesoinsEnAttente(): Observable<Besoin[]> {
  return this.http.get<Besoin[]>(`${this.apiUrl}/besoin/en-attente`);
}

getBesoinsByExpert(expertId: number): Observable<Besoin[]> {
  return this.http.get<Besoin[]>(`${this.apiUrl}/besoin/expert/${expertId}`);
}


modifierBesoin(besoin: Besoin): void {
  this.router.navigate(['/modifier-besoin', besoin.id]);
}

suivreEvolution(besoin: Besoin): void {
  this.router.navigate(['/suivi-evolution', besoin.id]);
}

// ── KEEP & REPLACE with this single version ──
deleteBesoin(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/besoin/${id}`);
}

updateBesoin(id: number, formData: FormData): Observable<any> {
  return this.http.put(`${this.apiUrl}/besoin/client/update/${id}`, formData);
}


getMesBesoinsValides(): Observable<Besoin[]> {
  const user = this.userDetails();
  return this.http.get<Besoin[]>(`${this.apiUrl}/besoin/client/${user.id}/valide`);
}
 
getMesBesoinsEnAttente(): Observable<Besoin[]> {
  const user = this.userDetails();
  return this.http.get<Besoin[]>(`${this.apiUrl}/besoin/client/${user.id}/en-attente`);
}
// Étape 1 : Expert valide rapidement (etat=true, statut=EN_ATTENTE_VALIDATION)
verifyBesoin(besoinId: number, descriptionExpert: string): Observable<any> {
  const user = this.userDetails();
  return this.http.put(
    `${this.apiUrl}/besoin/verify/${besoinId}/expert/${user.id}`,
    { descriptionExpert }
  );
}

// Étape 2 : Expert complète avec description détaillée + quantité (statut=VALIDE_PAR_EXPERT)
updateBesoinByExpert(
  besoinsId: number,
  expertId: number,
  descriptionExpert: string,
  quantite: number
): Observable<Besoin> {
  const params = new HttpParams()
    .set('descriptionExpert', descriptionExpert)
    .set('quantite', quantite.toString());

  return this.http.put<Besoin>(
    `${this.apiUrl}/besoin/expert/update/${besoinsId}/expert/${expertId}`,
    null,
    { params }
  );
}

/* ================= NOTIFICATIONS PRIX PROPOSÉ ================= */
private pollingSubscription!: Subscription;
private unreadContactsSubject = new BehaviorSubject<PrixProposer[]>([]);
public unreadContacts$ = this.unreadContactsSubject.asObservable();

startPolling(intervalMs: number): void {
  if (this.pollingSubscription) return;
  // Load immediately on start
  this.getUnreadPrixProposer().subscribe(data => this.unreadContactsSubject.next(data));
  // Then poll every intervalMs
  this.pollingSubscription = interval(intervalMs).pipe(
    switchMap(() => this.getUnreadPrixProposer())
  ).subscribe({
    next: (data) => this.unreadContactsSubject.next(data),
    error: (err) => console.error('Polling error:', err)
  });
}

stopPolling(): void {
  this.pollingSubscription?.unsubscribe();
}

getUnreadPrixProposer(): Observable<PrixProposer[]> {
  return this.http.get<PrixProposer[]>(`${this.apiUrl}/prixproposer/unread`);
}

markAsRead(id: number): Observable<void> {
  return this.http.patch<void>(`${this.apiUrl}/prixproposer/${id}/mark-as-read`, {});
}

markAllAsRead(): Observable<void> {
  return this.http.patch<void>(`${this.apiUrl}/prixproposer/mark-all-read`, {});
}
getAdminPrincipal(): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/admin/principal`);
}
// ================= SUIVI =================

// In CrudService, replace getSuivisByClientId() with this:

getSuivisByClientId(clientId: number): Observable<Suivi[]> {
  const token = sessionStorage.getItem('myTokenClient');
  return this.http.get<Suivi[]>(`${this.apiUrl}/suivi/client/${clientId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

getReservationsByFournisseur(fournisseurId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/reserver/fournisseur/${fournisseurId}`);
}
validerBesoin(besoinId: number): Observable<any> {
  return this.http.put(`${this.apiUrl}/besoin/valider/${besoinId}`, {});
}

getReservationsWithoutSuivi(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/reserver/without-suivi`);
}

createSuiviTempsReel(reservationId: number): Observable<any> {
  return this.http.post(`${this.apiUrl}/suivi/temps-reel/${reservationId}`, {});
}
getSuivisByFournisseurId(fournisseurId: number): Observable<Suivi[]> {
  const token = sessionStorage.getItem('myTokenFournisseur');
  return this.http.get<Suivi[]>(`${this.apiUrl}/suivi/fournisseur/${fournisseurId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
}
}