import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Suivi } from '../Entites/Suivi.Entites';

@Component({
  selector: 'app-ajouter-suivi-fournis',
  templateUrl: './ajouter-suivi-fournis.component.html',
  styleUrls: ['./ajouter-suivi-fournis.component.css']
})
export class AjouterSuiviFournisComponent implements OnInit {

  uploadForm: FormGroup = this.fb.group({ typeSuivi: ['PHOTO'] });

  avantFiles: File[] = [];
  apresFiles: File[] = [];
  avantHint = 'Cliquez ou glissez vos fichiers ici';
  apresHint = 'Cliquez ou glissez vos fichiers ici';

  reservationId!: number;

  // ✅ existingSuivi = already submitted suivi (view mode)
  // ✅ newSuivi      = just submitted in this session (success panel)
  existingSuivi: Suivi | null = null;
  newSuivi: Suivi | null = null;

  currentType: string = 'PHOTO';
  isLoading    = true;
  isSubmitting = false;

  private readonly apiBase = 'http://localhost:8081/api';

  get headerSubtitle(): string {
    return this.currentType === 'VIDEO'
      ? 'Comparaison avant / après par vidéos'
      : 'Comparaison avant / après par photos';
  }

  // suivi to display in the result/view panel (whichever exists)
  get displaySuivi(): Suivi | null {
    return this.newSuivi ?? this.existingSuivi;
  }

  // true  → show view-only panel, hide form
  get hasExistingSuivi(): boolean {
    return this.existingSuivi !== null;
  }

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('reservationId');
    if (id) {
      this.reservationId = +id;
    }

    // ✅ Check if a suivi already exists for this reservation
    this.checkExistingSuivi();
  }

  checkExistingSuivi(): void {
    const token = sessionStorage.getItem('myTokenFournisseur');
    if (!token) {
      this.isLoading = false;
      return;
    }

    this.http.get<Suivi[]>(
      `${this.apiBase}/suivi/fournisseur/${this.getFournisseurId(token)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: (suivis: Suivi[]) => {
        // Find a suivi that belongs to THIS reservation
        const found = suivis.find(
          s => Number(s.reserver?.id) === Number(this.reservationId)
        );
        this.existingSuivi = found ?? null;
        this.isLoading = false;
      },
      error: () => {
        // If endpoint fails just show the form
        this.existingSuivi = null;
        this.isLoading = false;
      }
    });
  }

  getFournisseurId(token: string): number {
    try {
      return JSON.parse(atob(token.split('.')[1])).data.id;
    } catch {
      return 0;
    }
  }

  setType(type: string): void {
    this.currentType = type;
    this.uploadForm.patchValue({ typeSuivi: type });
  }

  isPhotoOrVideo(): boolean {
    return this.currentType === 'PHOTO' || this.currentType === 'VIDEO';
  }

  onFileChange(event: Event, side: 'avant' | 'apres'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const files = Array.from(input.files);
    const hint  = files.map(f => f.name).join(', ');
    if (side === 'avant') {
      this.avantFiles = files;
      this.avantHint  = hint.length > 55 ? hint.substring(0, 52) + '…' : hint;
    } else {
      this.apresFiles = files;
      this.apresHint  = hint.length > 55 ? hint.substring(0, 52) + '…' : hint;
    }
  }

  onSubmit(): void {
    if (!this.reservationId) {
      alert('ID de réservation manquant');
      return;
    }
    if (this.avantFiles.length === 0 && this.apresFiles.length === 0) {
      alert('Veuillez sélectionner au moins un fichier.');
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('typeSuivi', this.uploadForm.get('typeSuivi')?.value);
    this.avantFiles.forEach(file => formData.append('avant', file));
    this.apresFiles.forEach(file => formData.append('apres', file));

    this.http.post<Suivi>(
      `${this.apiBase}/suivi/${this.reservationId}/upload`,
      formData
    ).subscribe({
      next: (res) => {
        // ✅ Move to view-only mode immediately after success
        this.newSuivi      = res;
        this.existingSuivi = res;
        this.isSubmitting  = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        alert('Erreur lors de l\'ajout du suivi. Vérifiez que le serveur est démarré.');
        this.isSubmitting = false;
      }
    });
  }

  fixUrl(url: string): string {
    if (!url) return '';
    return url.replace(
      'http://localhost:8081/uploads/',
      'http://localhost:8081/api/uploads/'
    );
  }

  isVideo(url: string): boolean {
    return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
  }

  goBack(): void {
    this.router.navigate(['/listeBesoin']);
  }
}