import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CrudService } from '../service/crud.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Fournisseur } from '../Entites/Fournisseur.Entites';

@Component({
  selector: 'app-modifier-fournisseur',
  templateUrl: './modifier-fournisseur.component.html',
  styleUrls: ['./modifier-fournisseur.component.css']
})
export class ModifierFournisseurComponent {

  id: number;
  fournisseurForm: FormGroup;

  constructor(
    private services: CrudService,
    private router: Router,
    private fb: FormBuilder,
    private rout: ActivatedRoute
  ) {

    let formControls = {
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
        Validators.pattern('^[a-zA-Z0-9._%+-]+@gmail\\.com$')
      ]),

      mdp: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[a-zA-Z0-9]+$')
      ]),

      adresse: new FormControl('', [
        Validators.required,
        Validators.minLength(3)
      ]),

      tlf: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]{8}$')
      ])
    };

    this.fournisseurForm = this.fb.group(formControls);
  }

  // Getters
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
        case 'email':
          return 'L\'email doit se terminer par @gmail.com';
        case 'mdp':
          return 'Le mot de passe doit contenir uniquement des caractères alphanumériques';
        case 'tlf':
          return 'Le téléphone doit contenir exactement 8 chiffres';
        default:
          return 'Format invalide';
      }
    }

    return '';
  }

  ngOnInit(): void {

    let idFournisseur = this.rout.snapshot.params['id'];
    this.id = idFournisseur;

    this.services.findFournisseurById(idFournisseur).subscribe({

      next: (result) => {

        let fournisseur = result;

        this.fournisseurForm.patchValue({
          nom: fournisseur.nom,
          prenom: fournisseur.prenom,
          email: fournisseur.email,
          mdp: fournisseur.mdp,
          adresse: fournisseur.adresse,
          tlf: fournisseur.tlf
        });

      },

      error: (err) => {

        console.error('Erreur lors du chargement du fournisseur:', err);

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger les informations du fournisseur'
        });
      }
    });
  }

  updateFournisseur() {

    if (this.fournisseurForm.invalid) {

      let errorMessages: string[] = [];

      Object.keys(this.fournisseurForm.controls).forEach(key => {
        const control = this.fournisseurForm.get(key);
        if (control?.invalid) {
          errorMessages.push(this.getErrorMessage(control, key));
        }
      });

      Swal.fire({
        icon: 'error',
        title: 'Champs invalides',
        html: errorMessages.join('<br>'),
        showConfirmButton: true
      });

      return;
    }

    let data = this.fournisseurForm.value;

    let fournisseur = new Fournisseur(
      this.id,
      data.nom,
      data.prenom,
      data.email,
      data.mdp,
      data.adresse,
      data.tlf
    );

    this.services.updateFournisseur(this.id, fournisseur).subscribe({

      next: (res) => {

        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Fournisseur modifié avec succès !',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/listeFournisseur']).then(() => {
            window.location.reload();
          });
        });
      },

      error: (err) => {

        console.error('Erreur lors de la modification:', err);

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la modification du fournisseur'
        });
      }
    });
  }

}
