import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CrudService } from '../service/crud.service';
import { ExpertAgricole } from '../Entites/ExpertAgricole.Entites';

@Component({
  selector: 'app-ajouter-expert',
  templateUrl: './ajouter-expert.component.html',
  styleUrls: ['./ajouter-expert.component.css']
})
export class AjouterExpertComponent {

  expertForm: FormGroup;
  messageCommande: string = '';

  constructor(
    private services: CrudService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.expertForm = this.fb.group({
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

  get nom() { return this.expertForm.get('nom'); }
  get prenom() { return this.expertForm.get('prenom'); }
  get email() { return this.expertForm.get('email'); }
  get mdp() { return this.expertForm.get('mdp'); }
  get adresse() { return this.expertForm.get('adresse'); }
  get tlf() { return this.expertForm.get('tlf'); }

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

  addNewExpert() {
    if (this.expertForm.invalid) {
      Object.keys(this.expertForm.controls).forEach(key => {
        const control = this.expertForm.get(key);
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

    const data = this.expertForm.value;

    const expert = new ExpertAgricole(
      undefined,
      data.nom,
      data.prenom,
      data.email,
      data.mdp,
      data.adresse,
      data.tlf
    );

    this.services.addExpert(expert).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Expert ajouté avec succès !',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/listeExpert']).then(() => {
            window.location.reload();
          });
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur s’est produite lors de l’ajout de l’expert'
        });
      }
    });
  }
}
