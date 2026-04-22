import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Suivi } from '../Entites/Suivi.Entites';

@Component({
  selector: 'app-ajouter-suivi-fournis',
  templateUrl: './ajouter-suivi-fournis.component.html',
  styleUrls: ['./ajouter-suivi-fournis.component.css']
})
export class AjouterSuiviFournisComponent implements OnInit {

  uploadForm: FormGroup = this.fb.group({
    typeSuivi: ['PHOTO']
  });

  avantFiles: File[] = [];
  apresFiles: File[] = [];

  avantHint  = 'Cliquez ou glissez vos fichiers ici';
  apresHint  = 'Cliquez ou glissez vos fichiers ici';

  reservationId!: number;
  suivi!: Suivi;

  // ── FIX: plain string field — NOT a getter reading from the form.
  // Reading uploadForm.value inside a getter causes the template to see
  // the OLD value because Angular's change detection hasn't flushed yet
  // when the button click fires patchValue. A plain field updates instantly.
  currentType: string = 'PHOTO';

  get headerSubtitle(): string {
    switch (this.currentType) {
      case 'VIDEO':      return 'Comparaison avant / après par vidéos';
      case 'TEMPS_REEL': return 'Diffusion en temps réel via Google Meet';
      default:           return 'Comparaison avant / après par photos';
    }
  }

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('reservationId');
    if (id) this.reservationId = +id;
  }

  // ─── Type selector ────────────────────────────────────────────────────────

  setType(type: string): void {
    // Update BOTH the plain field AND the form control
    this.currentType = type;
    this.uploadForm.patchValue({ typeSuivi: type });
    // Reset result when switching types
    this.suivi = undefined!;
  }

  isPhotoOrVideo(): boolean {
    return this.currentType === 'PHOTO' || this.currentType === 'VIDEO';
  }

  isTempsReel(): boolean {
    return this.currentType === 'TEMPS_REEL';
  }

  // ─── File handling ────────────────────────────────────────────────────────

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

  // ─── Form submission ──────────────────────────────────────────────────────

  onSubmit(): void {
    const formData = new FormData();
    formData.append('typeSuivi', this.currentType);

    this.avantFiles.forEach(f => formData.append('avantFiles', f));
    this.apresFiles.forEach(f => formData.append('apresFiles', f));

    this.http
      .post<Suivi>(
        `http://localhost:8081/suivi/${this.reservationId}/upload`,
        formData
      )
      .subscribe({
        next:  res  => (this.suivi = res),
        error: err  => console.error('Upload failed', err)
      });
  }

  // ─── Real-time / Meet ─────────────────────────────────────────────────────

  createTempsReel(): void {
    this.http
      .post<Suivi>(
        `http://localhost:8081/suivi/${this.reservationId}/temps-reel`,
        {}
      )
      .subscribe({
        next:  res  => (this.suivi = res),
        error: err  => console.error('Temps réel creation failed', err)
      });
  }
}