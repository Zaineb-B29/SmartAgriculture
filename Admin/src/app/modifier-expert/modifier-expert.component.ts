import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CrudService } from '../service/crud.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpertAgricole } from '../Entites/ExpertAgricole.Entites';

@Component({
  selector: 'app-modifier-expert',
  templateUrl: './modifier-expert.component.html',
  styleUrls: ['./modifier-expert.component.css']
})
export class ModifierExpertComponent {

  id: number;
  expertForm: FormGroup;

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

    this.expertForm = this.fb.group(formControls);
  }

  // Getters
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

    let idExpert = this.rout.snapshot.params['id'];
    this.id = idExpert;

    this.services.findExpertById(idExpert).subscribe({

      next: (result) => {

        let expert = result;

        this.expertForm.patchValue({
          nom: expert.nom,
          prenom: expert.prenom,
          email: expert.email,
          mdp: expert.mdp,
          adresse: expert.adresse,
          tlf: expert.tlf
        });

      },

      error: (err) => {

        console.error('Erreur lors du chargement de l\'expert:', err);

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger les informations de l\'expert'
        });
      }
    });
  }

  updateExpert() {

    if (this.expertForm.invalid) {

      let errorMessages: string[] = [];

      Object.keys(this.expertForm.controls).forEach(key => {
        const control = this.expertForm.get(key);
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

    let data = this.expertForm.value;

    let expert = new ExpertAgricole(
      this.id,
      data.nom,
      data.prenom,
      data.email,
      data.mdp,
      data.adresse,
      data.tlf
    );

    this.services.updateEtatExpert(this.id, expert).subscribe({

      next: (res) => {

        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Expert modifié avec succès !',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/listeExpert']).then(() => {
            window.location.reload();
          });
        });
      },

      error: (err) => {

        console.error('Erreur lors de la modification:', err);

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la modification de l\'expert'
        });
      }
    });
  }

}
