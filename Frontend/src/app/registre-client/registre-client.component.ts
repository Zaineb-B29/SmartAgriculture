import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Client } from '../Entites/Client.Entites';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-registre-client',
  templateUrl: './registre-client.component.html',
  styleUrls: ['./registre-client.component.css']
})
export class RegistreClientComponent {
  clientForm: FormGroup;
  messageCommande: string = '';

  constructor(
    private services: CrudService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.clientForm = this.fb.group({
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

  // ===== Getters (comme Admin) =====
  get nom() { return this.clientForm.get('nom'); }
  get prenom() { return this.clientForm.get('prenom'); }
  get email() { return this.clientForm.get('email'); }
  get mdp() { return this.clientForm.get('mdp'); }
  get adresse() { return this.clientForm.get('adresse'); }
  get tlf() { return this.clientForm.get('tlf'); }

  // ===== Messages d’erreur (même logique que Admin) =====
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

  addNewClient() {
    if (this.clientForm.invalid) {
      Object.keys(this.clientForm.controls).forEach(key => {
        const control = this.clientForm.get(key);
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

    const data = this.clientForm.value;
    const client = new Client(
      undefined,
      data.nom,
      data.prenom,
      data.email,
      data.mdp,
      data.adresse,
      data.tlf
    );

    this.services.addclient(client).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Client ajouté avec succès !',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/listClient']).then(() => {
            window.location.reload();
          });
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur s’est produite lors de l’ajout du client'
        });
      }
    });
  }
}
