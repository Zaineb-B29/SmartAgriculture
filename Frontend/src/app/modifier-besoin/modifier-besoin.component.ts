import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Besoin } from '../Entites/Besoin.Entites';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-modifier-besoin',
  templateUrl: './modifier-besoin.component.html',
  styleUrls: ['./modifier-besoin.component.css']
})
export class ModifierBesoinComponent implements OnInit {
  besoin: Besoin | null = null;
  editForm!: FormGroup;
  selectedFile: File | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private service: CrudService
  ) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      titre:        ['', Validators.required],
      description:  ['', Validators.required],
      nombreArbres: ['', Validators.required],
      lieu:         ['', Validators.required],
      metrage:      ['', Validators.required]
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.service.getBesoinById(id).subscribe({
      next: (b: Besoin) => {
        this.besoin = b;
        this.editForm.patchValue({
          titre:        b.titre,
          description:  b.description,
          nombreArbres: b.nombreArbres,
          lieu:         b.lieu,
          metrage:      b.metrage
        });
      },
      error: () => {
        Swal.fire('Erreur', 'Besoin introuvable.', 'error');
        this.router.navigate(['/listeBesoin']);
      }
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null;
  }

  onSubmit(): void {
    // ✅ editForm (pas besoinForm) + image optionnelle pour la modification
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      Swal.fire({ icon: 'error', title: 'Erreur', text: 'Tous les champs sont obligatoires' });
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
    formData.append('titre',        this.editForm.value.titre);
    formData.append('description',  this.editForm.value.description);
    formData.append('nombreArbres', this.editForm.value.nombreArbres);
    formData.append('lieu',         this.editForm.value.lieu);
    formData.append('metrage',      this.editForm.value.metrage);

    // ✅ Image optionnelle — on l'ajoute seulement si l'utilisateur en choisit une
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    // ✅ service.updateBesoin (pas addBesoin)
    this.service.updateBesoin(this.besoin!.id!, formData).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Besoin modifié avec succès'
        }).then(() => {
          this.router.navigate(['/listeBesoin']);
        });
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Modification échouée' });
        console.error(err);
      }
    });
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/listeBesoin']);
    }
  }
}