import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-ajouter-besoin',
  templateUrl: './ajouter-besoin.component.html',
  styleUrls: ['./ajouter-besoin.component.css']
})
export class AjouterBesoinComponent implements OnInit {

  besoinForm: FormGroup;
  selectedFile!: File;
  isLoading = false;
  imageError = false;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private crudService: CrudService
  ) {
    this.besoinForm = this.fb.group({
      titre:        ['', Validators.required],
      description:  ['', Validators.required],
      nombreArbres: ['', Validators.required],
      lieu:         ['', Validators.required],
      metrage:      ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (!this.crudService.isClientIn()) {
      this.router.navigate(['/loginClient']);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.imageError = false;
    }
  }

  // ── Polls backend every 3s until maladie is filled ──────────
  private pollForAiResult(besoinId: number, maxAttempts = 20): void {
    let attempts = 0;

    // Update the Swal HTML with a live dots animation
    const dotInterval = setInterval(() => {
      const el = document.getElementById('ai-status-text');
      if (el) {
        const dots = '.'.repeat((attempts % 3) + 1);
        el.textContent = `Analyse en cours${dots}`;
      }
    }, 600);

    const poll = setInterval(() => {
      attempts++;

      this.crudService.getBesoinById(besoinId).subscribe({
        next: (besoin: any) => {
          // ✅ L'analyse est terminée (ou le max d'essais est atteint)
          if (besoin?.maladie || attempts >= maxAttempts) {
            clearInterval(poll);
            clearInterval(dotInterval);

            // On affiche un message de succès simple, SANS afficher le diagnostic de l'IA
            Swal.fire({
              icon: 'success',
              title: ' Besoin enregistré !',
              text: 'Votre demande a été enregistrée avec succès. Vous pouvez suivre son évolution dans votre liste.',
              confirmButtonText: 'Voir mes besoins',
              confirmButtonColor: '#4CAF50',
              width: '420px'
            }).then(() => {
              this.router.navigate(['/listeBesoin']);
            });
          }
        },
        error: () => {
          // Ne pas stopper le polling en cas d'erreur réseau temporaire, passer à l'essai suivant
        }
      });
    }, 3000); // poll toutes les 3 secondes
  }

  onSubmit() {
    if (!this.selectedFile) {
      this.imageError = true;
    }

    if (this.besoinForm.invalid || !this.selectedFile) {
      this.besoinForm.markAllAsTouched();
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Tous les champs sont obligatoires'
      });
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
    formData.append('image',        this.selectedFile);
    formData.append('titre',        this.besoinForm.value.titre);
    formData.append('description',  this.besoinForm.value.description);
    formData.append('nombreArbres', this.besoinForm.value.nombreArbres);
    formData.append('lieu',         this.besoinForm.value.lieu);
    formData.append('metrage',      this.besoinForm.value.metrage);

    const clientId = this.crudService.userDetails().id;

    this.crudService.addBesoin(clientId, formData).subscribe({
      next: (createdBesoin: any) => {
        this.isLoading = false;
        this.besoinForm.reset();
        this.selectedFile = undefined!;
        if (this.fileInput) this.fileInput.nativeElement.value = '';


        // ── Show persistent AI loading Swal ──────────
        Swal.fire({
          icon: 'success',
          title: '✅ Besoin enregistré !',
          text: 'Votre demande a été enregistrée et analysée avec succès.',
          confirmButtonText: 'Voir mes besoins',
          confirmButtonColor: '#4CAF50'
        }).then(() => {
          this.router.navigate(['/listeBesoin']).then(() => {
            window.location.reload(); // ✅ force le rechargement après navigation
          });
        });
        // ── Start polling for AI result ───────────────
        // createdBesoin should be the saved entity with its id
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Upload échoué'
        });
        console.error(err);
      }
    });
  }
}