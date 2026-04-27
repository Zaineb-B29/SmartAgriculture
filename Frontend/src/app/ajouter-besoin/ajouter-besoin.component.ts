import { Component, OnInit } from '@angular/core';
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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private crudService: CrudService
  ) {
    this.besoinForm = this.fb.group({
      image: [null, Validators.required],
      titre: ['', Validators.required],
      description: ['', Validators.required],
      nombreArbres: ['', Validators.required],
      lieu: ['', Validators.required],
      metrage: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  if (!this.crudService.isClientIn()) {  // vérifie spécifiquement le client
    this.router.navigate(['/loginClient']);
  }
}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.besoinForm.patchValue({
      image: this.selectedFile
    });
  }

  onSubmit() {
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
    formData.append('image', this.selectedFile);
    formData.append('titre', this.besoinForm.value.titre);
    formData.append('description', this.besoinForm.value.description);
    formData.append('nombreArbres', this.besoinForm.value.nombreArbres);
    formData.append('lieu', this.besoinForm.value.lieu);
    formData.append('metrage', this.besoinForm.value.metrage);

    const clientId = this.crudService.userDetails().id;

    this.crudService.addBesoin(clientId, formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.besoinForm.reset();

        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Besoin ajouté avec succès'
        }).then(() => {
          this.besoinForm.reset();
          this.router.navigate(['/listeBesoin']);
        });
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
