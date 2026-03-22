import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Besoin } from '../Entites/Besoin.Entites';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-ajouter-besoin',
  templateUrl: './ajouter-besoin.component.html',
  styleUrls: ['./ajouter-besoin.component.css']
})
export class AjouterBesoinComponent {
  besoinForm: FormGroup;

  constructor(
    private services: CrudService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.besoinForm = this.fb.group({
      image: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required, Validators.minLength(5)]),
      type: new FormControl('', [Validators.required]),
      nombreArbres: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$')]),
      lieu: new FormControl('', [Validators.required]),
      metrage: new FormControl('', [Validators.required])
    });
  }

  ngOnInit(): void {}

  get image() { return this.besoinForm.get('image'); }
  get description() { return this.besoinForm.get('description'); }
  get type() { return this.besoinForm.get('type'); }
  get nombreArbres() { return this.besoinForm.get('nombreArbres'); }
  get lieu() { return this.besoinForm.get('lieu'); }
  get metrage() { return this.besoinForm.get('metrage'); }

  getErrorMessage(control: any, fieldName: string) {
    if (control.hasError('required')) {
      return `Le champ ${fieldName} est obligatoire`;
    }
    if (control.hasError('minlength')) {
      return `Le champ ${fieldName} doit contenir au moins ${control.errors.minlength.requiredLength} caractères`;
    }
    if (control.hasError('pattern')) {
      if (fieldName === 'nombreArbres') {
        return `Le champ ${fieldName} doit contenir uniquement des chiffres`;
      }
      return 'Format invalide';
    }
    return '';
  }

  addNewBesoin() {
    if (this.besoinForm.invalid) {
      Object.keys(this.besoinForm.controls).forEach(key => {
        const control = this.besoinForm.get(key);
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

    const data = this.besoinForm.value;
    const besoin = new Besoin(
      undefined,
      data.image,
      data.description,
      data.type,
      data.nombreArbres,
      data.lieu,
      data.metrage
    );

    const clientId = 4; // Remplacez par l'ID du client connecté

    this.services.addBesoin(clientId, besoin).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Besoin ajouté avec succès !',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/liste-besoins']).then(() => {
            window.location.reload();
          });
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur s’est produite lors de l’ajout du besoin'
        });
      }
    });
  }
}