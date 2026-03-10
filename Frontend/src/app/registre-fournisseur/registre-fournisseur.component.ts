import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Fournisseur } from '../Entites/Fournisseur.Entites';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-registre-fournisseur',
  templateUrl: './registre-fournisseur.component.html',
  styleUrls: ['./registre-fournisseur.component.css']
})
export class RegistreFournisseurComponent {
  fournisseurForm: FormGroup;
  messageCommande: string = '';

  constructor(
    private services: CrudService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.fournisseurForm = this.fb.group({
      nom: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern("^[a-zA-ZÀ-ÿ\\s'-]+$")
      ]),
      prenom: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern("^[a-zA-ZÀ-ÿ\\s'-]+$")
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      mdp: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[a-zA-Z0-9]+$')
      ]),
      adresse: new FormControl('', [
        Validators.required
      ]),
      tlf: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]{8}$')
      ])
    });
  }

  ngOnInit(): void {}

  // ===== Getters =====
  get nom() { return this.fournisseurForm.get('nom'); }
  get prenom() { return this.fournisseurForm.get('prenom'); }
  get email() { return this.fournisseurForm.get('email'); }
  get mdp() { return this.fournisseurForm.get('mdp'); }
  get adresse() { return this.fournisseurForm.get('adresse'); }
  get tlf() { return this.fournisseurForm.get('tlf'); }

  getErrorMessage(control: any, fieldName: string) {
    if (control.hasError('required')) {
      return `Le champ ${fieldName} est obligatoire`;
    }
    if (control.hasError('minlength')) {
      return `Le champ ${fieldName} doit contenir au moins ${control.errors.minlength.requiredLength} caractères`;
    }
    if (control.hasError('pattern')) {
      switch (fieldName) {
        case 'nom':
        case 'prenom':
          return 'Seuls les caractères alphabétiques sont autorisés';
        case 'mdp':
          return 'Le mot de passe doit être alphanumérique';
        case 'tlf':
          return 'Le numéro de téléphone doit contenir 8 chiffres';
        default:
          return 'Format invalide';
      }
    }
    if (control.hasError('email')) {
      return 'Email invalide';
    }
    return '';
  }

  addNewFournisseur() {
    if (this.fournisseurForm.invalid) {
      Object.keys(this.fournisseurForm.controls).forEach(key => {
        const control = this.fournisseurForm.get(key);
        if (control?.invalid) {
          const errorMessage = this.getErrorMessage(control, key);
          Swal.fire({
            icon: 'error',
            title: 'Champ invalide',
            text: errorMessage
          });
        }
      });
      return;
    }

    const data = this.fournisseurForm.value;

    const fournisseur = new Fournisseur(
      undefined,
      data.nom,
      data.prenom,
      data.email,
      data.mdp,
      data.adresse,
      data.tlf
    );

    this.services.addFournisseur(fournisseur).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Fournisseur ajouté avec succès',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/listeFournisseur']).then(() => {
            window.location.reload();
          });
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de l’ajout du fournisseur'
        });
      }
    });
  }
}
