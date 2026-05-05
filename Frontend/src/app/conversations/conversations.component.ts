import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from '../service/crud.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-conversations',
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.css']
})
export class ConversationsComponent implements OnInit {

  myType = '';
  myId   = 0;

  conversations: any[] = [];  // { otherType, otherId, otherName, lastMessage, lastDate, unread }
  isLoading = true;

  // Side panel
  selectedConv: any = null;
  relatedBesoin: any = null;
  loadingBesoin = false;

  constructor(private service: CrudService, private router: Router) {}

  ngOnInit(): void {
    const type  = sessionStorage.getItem('type') || '';
    const token = sessionStorage.getItem('myTokenClient')
               || sessionStorage.getItem('myTokenFournisseur')
               || sessionStorage.getItem('myTokenExpert');

    if (!token) { this.router.navigate(['/']); return; }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.myId   = payload.data?.id || 0;
      this.myType = type;
    } catch { this.router.navigate(['/']); return; }

    this.loadConversations();
  }

  loadConversations(): void {
    this.isLoading = true;
    this.service.getMyContacts(this.myType, this.myId).subscribe({
      next: (messages: any[]) => {
        // Build conversation list from latest messages
        const convMap: { [key: string]: any } = {};

        messages.forEach(msg => {
          const isMe = msg.expediteurType === this.myType && msg.expediteurId === this.myId;
          const otherType = isMe ? msg.destinataireType : msg.expediteurType;
          const otherId   = isMe ? msg.destinataireId   : msg.expediteurId;
          const key = `${otherType}_${otherId}`;

          if (!convMap[key]) {
            convMap[key] = {
              otherType,
              otherId,
              otherName: this.getLabelForType(otherType) + ' #' + otherId,
              lastMessage: msg.contenu || (msg.typeMedia === 'IMAGE' ? '📷 Image' : '🎥 Vidéo'),
              lastDate: msg.dateEnvoi,
              unread: !msg.lu && !isMe
            };
          }
        });

        const convList = Object.values(convMap);

        // Resolve real names
        const nameRequests = convList.map(c => this.getNameRequest(c.otherType, c.otherId));
        forkJoin(nameRequests).subscribe({
          next: (users: any[]) => {
            users.forEach((u, i) => {
              if (u) convList[i].otherName = `${u.prenom || ''} ${u.nom || ''}`.trim() || convList[i].otherName;
              // also store avatar initials
              convList[i].initials = this.getInitials(convList[i].otherName);
            });
            this.conversations = convList;
            this.isLoading = false;
          },
          error: () => { this.conversations = convList; this.isLoading = false; }
        });
      },
      error: () => this.isLoading = false
    });
  }

  getNameRequest(type: string, id: number) {
    switch (type) {
      case 'CLIENT':      return this.service.getClientById(id).pipe(catchError(() => of(null)));
      case 'FOURNISSEUR': return this.service.getFournisseurById(id).pipe(catchError(() => of(null)));
      case 'EXPERT':      return this.service.getExpertById(id).pipe(catchError(() => of(null)));
      default:            return of({ nom: 'Administrateur', prenom: '' });
    }
  }

  selectConversation(conv: any): void {
    this.selectedConv  = conv;
    this.relatedBesoin = null;
    this.loadingBesoin = true;

    // Try to load related besoin if fournisseur↔client
    if ((this.myType === 'FOURNISSEUR' && conv.otherType === 'CLIENT') ||
        (this.myType === 'CLIENT' && conv.otherType === 'FOURNISSEUR')) {

      const clientId      = this.myType === 'CLIENT' ? this.myId : conv.otherId;
      const fournisseurId = this.myType === 'FOURNISSEUR' ? this.myId : conv.otherId;

      this.service.getMesReservations(clientId).subscribe({
        next: (reservations: any[]) => {
          const match = reservations.find(r =>
            r.prixProposer?.fournisseur?.id === fournisseurId
          );
          this.relatedBesoin = match?.prixProposer?.besoin || null;
          this.loadingBesoin = false;
        },
        error: () => this.loadingBesoin = false
      });
    } else {
      this.loadingBesoin = false;
    }
  }

  openChat(conv: any): void {
    this.router.navigate(['/message'], {
      queryParams: {
        myType:    this.myType,
        myId:      this.myId,
        otherType: conv.otherType,
        otherId:   conv.otherId
      }
    });
  }

  getLabelForType(type: string): string {
    switch (type) {
      case 'ADMIN':       return 'Administrateur';
      case 'CLIENT':      return 'Agriculteur';
      case 'EXPERT':      return 'Expert Agricole';
      case 'FOURNISSEUR': return 'Fournisseur';
      default:            return type;
    }
  }

  getRoleEmoji(type: string): string {
    switch (type) {
      case 'ADMIN':       return '🛡️';
      case 'CLIENT':      return '🌾';
      case 'EXPERT':      return '🔬';
      case 'FOURNISSEUR': return '🚚';
      default:            return '👤';
    }
  }

  getInitials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2)
               .map(n => n[0].toUpperCase()).join('');
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString())
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Hier';
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }
}