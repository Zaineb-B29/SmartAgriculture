import {
  Component, OnInit, OnDestroy, ViewChild, ElementRef,
  AfterViewChecked, ChangeDetectorRef
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from '../service/crud.service';
import { Message } from '../Entites/Message.Entites';
import Swal from 'sweetalert2';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('chatBox')   chatBox!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // ── Identité des deux interlocuteurs (passés via query params ou route) ──
  myType      = '';   // ex: 'ADMIN'
  myId        = 0;
  otherType   = '';   // ex: 'CLIENT' | 'EXPERT' | 'FOURNISSEUR'
  otherId     = 0;
  otherLabel  = '';   // Nom affiché dans la topbar

  // ── Chat ────────────────────────────────────────────────────────────────
  messages: Message[]  = [];
  newMessage           = '';
  isSending            = false;
  shouldScroll         = false;
  private pollSub?: Subscription;

  // ── Pièce jointe ────────────────────────────────────────────────────────
  attachedFile: File | null     = null;
  attachedPreviewUrl: string | null = null;
  isUploadingFile = false;

  // ── Lightbox ─────────────────────────────────────────────────────────────
  lightboxUrl: string | null          = null;
  lightboxType: 'image' | 'video' | null = null;

  // ── Sidebar ──────────────────────────────────────────────────────────────
  activeHistTab: 'media' | 'links' = 'media';
  sidebarOpen = true;

  constructor(
    private service: CrudService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

    ngOnInit() {
      const p = this.route.snapshot.queryParamMap;

      this.myType    = p.get('myType')    || 'ADMIN';
      this.otherId   = +(p.get('otherId') ?? 0);
      this.otherType = p.get('otherType') || '';

      // Pour l'admin : utiliser userDetails() du service
      try {
        const details = this.service.userDetails();
        this.myId = details?.id || 1;
      } catch {
        this.myId = 1;
      }

      console.log('myType:', this.myType);
      console.log('myId:', this.myId);
      console.log('otherType:', this.otherType);
      console.log('otherId:', this.otherId);

      this.otherLabel = this.getLabelForType(this.otherType) + ' #' + this.otherId;

      this.chargerMessages();
      this.service.marquerLus(this.myType, this.myId, this.otherType, this.otherId)
          .subscribe({ error: () => {} });

      this.pollSub = interval(4000).pipe(
        switchMap(() => this.service.getConversation(this.myType, this.myId, this.otherType, this.otherId))
      ).subscribe({
        next: (msgs) => {
          if (msgs.length !== this.messages.length) {
            this.messages = msgs;
            this.shouldScroll = true;
            this.service.marquerLus(this.myType, this.myId, this.otherType, this.otherId)
                .subscribe({ error: () => {} });
          }
        },
        error: () => {}
      });
    }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
    if (this.attachedPreviewUrl) URL.revokeObjectURL(this.attachedPreviewUrl);
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  chargerMessages() {
    this.service.getConversation(this.myType, this.myId, this.otherType, this.otherId).subscribe({
      next: (msgs) => {
        this.messages    = msgs;
        this.shouldScroll = true;
      },
      error: () => {}
    });
  }

  scrollToBottom() {
    try { this.chatBox.nativeElement.scrollTop = this.chatBox.nativeElement.scrollHeight; } catch {}
  }

  // ── Envoi texte ──────────────────────────────────────────────────────────

  envoyerMessage() {
    const contenu = this.newMessage.trim();
    if (!contenu || this.isSending) return;
    this.isSending = true;
    this.service.envoyerMessage(this.myType, this.myId, this.otherType, this.otherId, contenu).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.newMessage   = '';
        this.isSending    = false;
        this.shouldScroll = true;
      },
      error: () => {
        this.isSending = false;
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Message non envoyé.', timer: 2000, showConfirmButton: false });
      }
    });
  }

  // ── Pièce jointe ────────────────────────────────────────────────────────

  onAttachClick() {
    this.fileInput.nativeElement.value = '';
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const allowed = ['image/jpeg','image/png','image/gif','image/webp','video/mp4','video/webm','video/ogg'];
    if (!allowed.includes(file.type)) {
      Swal.fire({ icon: 'warning', title: 'Type non supporté', text: 'Images et vidéos uniquement.', timer: 3000, showConfirmButton: false });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      Swal.fire({ icon: 'warning', title: 'Fichier trop grand', text: 'Maximum 50 Mo.', timer: 3000, showConfirmButton: false });
      return;
    }
    if (this.attachedPreviewUrl) URL.revokeObjectURL(this.attachedPreviewUrl);
    this.attachedFile      = file;
    this.attachedPreviewUrl = URL.createObjectURL(file);
    this.cdr.detectChanges();
  }

  removeAttachment() {
    if (this.attachedPreviewUrl) URL.revokeObjectURL(this.attachedPreviewUrl);
    this.attachedFile      = null;
    this.attachedPreviewUrl = null;
  }

  isImageFile(file: File | null): boolean { return !!file && file.type.startsWith('image/'); }
  isVideoFile(file: File | null): boolean { return !!file && file.type.startsWith('video/'); }

  envoyerFichier() {
    if (!this.attachedFile || this.isUploadingFile) return;
    this.isUploadingFile = true;
    const file       = this.attachedFile;
    const previewUrl = this.attachedPreviewUrl;
    const caption    = this.newMessage.trim();

    this.service.envoyerMessageFichier(this.myType, this.myId, this.otherType, this.otherId, file, caption).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.newMessage = '';
        this.removeAttachment();
        this.isUploadingFile = false;
        this.shouldScroll    = true;
      },
      error: () => {
        // Fallback: show locally with blob URL
        const localMsg: Message = {
          contenu:        caption,
          dateEnvoi:      new Date().toISOString(),
          expediteurType: this.myType,
          expediteurId:   this.myId,
          destinataireType: this.otherType,
          destinataireId:   this.otherId,
          lu:             false,
          fileUrl:        previewUrl ?? undefined,
          typeMedia:      this.isImageFile(file) ? 'IMAGE' : 'VIDEO'
        };
        this.messages.push(localMsg);
        this.newMessage = '';
        this.removeAttachment();
        this.isUploadingFile = false;
        this.shouldScroll    = true;
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
  }

  // ── Helpers message type ─────────────────────────────────────────────────

  isImageMessage(msg: Message): boolean {
    if (msg.typeMedia === 'IMAGE') return true;
    if (msg.fileUrl) {
      const url = msg.fileUrl.split('?')[0].toLowerCase();
      return url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png')
          || url.endsWith('.gif') || url.endsWith('.webp');
    }
    return false;
  }

  isVideoMessage(msg: Message): boolean {
    if (msg.typeMedia === 'VIDEO') return true;
    if (msg.fileUrl) {
      const url = msg.fileUrl.split('?')[0].toLowerCase();
      return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg');
    }
    return false;
  }

  resolveUrl(url: string | undefined): string {
    if (!url) return '';
    if (url.startsWith('blob:') || url.startsWith('http')) return url;
    return url;
  }

  renderTextWithLinks(text: string): string {
    if (!text) return '';
    return text.replace(/(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener" class="chat-link">$1</a>');
  }

  // ── Sidebar computed ─────────────────────────────────────────────────────

  get mediaMessages(): Message[] {
    return this.messages.filter(m => this.isImageMessage(m) || this.isVideoMessage(m));
  }

  get linkMessages(): Message[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return this.messages.filter(m => m.contenu && urlRegex.test(m.contenu));
  }

  extractFirstLink(text: string): string {
    const m = text.match(/(https?:\/\/[^\s]+)/);
    return m ? m[1] : '#';
  }

  // ── Lightbox ─────────────────────────────────────────────────────────────

  openLightbox(url: string, type: 'image' | 'video') {
    this.lightboxUrl  = url;
    this.lightboxType = type;
  }

  closeLightbox() {
    this.lightboxUrl  = null;
    this.lightboxType = null;
  }

  downloadFile(url: string) {
    const a = document.createElement('a');
    a.href = url; a.download = 'fichier'; a.target = '_blank';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  // ── Suppression ───────────────────────────────────────────────────────────

  supprimerMessage(msg: Message, index: number) {
    Swal.fire({
      title: 'Supprimer ce message ?', icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c', cancelButtonColor: '#6c757d',
      confirmButtonText: 'Supprimer', cancelButtonText: 'Annuler'
    }).then(r => {
      if (r.isConfirmed) {
        this.service.supprimerMessage(msg.id!).subscribe({
          next: () => this.messages.splice(index, 1),
          error: () => Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de supprimer.', timer: 2000, showConfirmButton: false })
        });
      }
    });
  }

  supprimerConversation() {
    Swal.fire({
      title: 'Supprimer toute la conversation ?', text: 'Cette action est irréversible.', icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c', cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, tout supprimer', cancelButtonText: 'Annuler'
    }).then(r => {
      if (r.isConfirmed) {
        this.service.supprimerConversation(this.myType, this.myId, this.otherType, this.otherId).subscribe({
          next: () => {
            this.messages = [];
            Swal.fire({ icon: 'success', title: 'Conversation supprimée', timer: 2000, showConfirmButton: false });
          },
          error: () => Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de supprimer.', timer: 2000, showConfirmButton: false })
        });
      }
    });
  }

  // ── UI helpers ────────────────────────────────────────────────────────────

  isMyMessage(msg: Message): boolean {
    return msg.expediteurType === this.myType && msg.expediteurId === this.myId;
  }

  getSenderLabel(msg: Message): string {
    return this.getLabelForType(msg.expediteurType ?? '');
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

  getRoleEmoji(type: string | undefined): string {
    switch (type) {
      case 'ADMIN':       return '🛡️';
      case 'CLIENT':      return '🌾';
      case 'EXPERT':      return '🔬';
      case 'FOURNISSEUR': return '🚚';
      default:            return '👤';
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (this.attachedFile) this.envoyerFichier();
      else this.envoyerMessage();
    }
  }

  formatTime(dateStr: string | undefined): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Hier';
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  showDateSeparator(index: number): boolean {
    if (index === 0) return true;
    const prev = new Date(this.messages[index - 1].dateEnvoi!);
    const curr = new Date(this.messages[index].dateEnvoi!);
    return prev.toDateString() !== curr.toDateString();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}