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
  imageError = false;  // to show validation error for image

  // Reference to the file input so we can clear it manually
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private crudService: CrudService
  ) {
    // image is NOT in the FormGroup — handled separately to avoid the browser error
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

  onSubmit() {
    // Validate image manually
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
      next: () => {
        this.isLoading = false;

        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Besoin ajouté avec succès ! L\'analyse IA est en cours...'
        }).then(() => {
          // Reset form safely — file input cleared via ViewChild, not patchValue
          this.besoinForm.reset();
          this.selectedFile = undefined!;
          this.imageError = false;
          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }
          this.router.navigate(['/listeBesoin']).then(()=>{window.location.reload()});
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