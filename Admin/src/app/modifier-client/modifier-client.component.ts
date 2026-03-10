import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { Client } from '../Entites/Client.Entites';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CrudService } from '../service/crud.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-modifier-client',
  templateUrl: './modifier-client.component.html',
  styleUrls: ['./modifier-client.component.css']
})
export class ModifierClientComponent {

  id: number;
  clientForm: FormGroup;

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

    this.clientForm = this.fb.group(formControls);
  }

  // Getters
  get nom() { return this.clientForm.get('nom'); }
  get prenom() { return this.clientForm.get('prenom'); }
  get email() { return this.clientForm.get('email'); }
  get mdp() { return this.clientForm.get('mdp'); }
  get adresse() { return this.clientForm.get('adresse'); }
  get tlf() { return this.clientForm.get('tlf'); }

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

    let idClient = this.rout.snapshot.params['id'];
    this.id = idClient;

    this.services.findClientById(idClient).subscribe({

      next: (result) => {

        let client = result;

        this.clientForm.patchValue({
          nom: client.nom,
          prenom: client.prenom,
          email: client.email,
          mdp: client.mdp,
          adresse: client.adresse,
          tlf: client.tlf
        });

      },

      error: (err) => {

        console.error('Erreur lors du chargement du client:', err);

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger les informations du client'
        });
      }
    });
  }

  updateClient() {

    if (this.clientForm.invalid) {

      let errorMessages: string[] = [];

      Object.keys(this.clientForm.controls).forEach(key => {
        const control = this.clientForm.get(key);
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

    let data = this.clientForm.value;

    let client = new Client(
      this.id,
      data.nom,
      data.prenom,
      data.email,
      data.mdp,
      data.adresse,
      data.tlf
    );

    this.services.updateClient(this.id, client).subscribe({

      next: (res) => {

        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Client modifié avec succès !',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/listeClient']).then(() => {
            window.location.reload();
          });
        });
      },

      error: (err) => {

        console.error('Erreur lors de la modification:', err);

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la modification du client'
        });
      }
    });
  }

}
