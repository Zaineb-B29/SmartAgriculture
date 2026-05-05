import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  profileForm!: FormGroup;
  currentUser: any = null;
  userType: string | null = null;
  submitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private service: CrudService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.service.userDetails();
    this.userType = this.service.getCurrentUserType();

    if (!this.currentUser || !this.userType) {
      this.router.navigate(['/']);
      return;
    }

    this.profileForm = this.fb.group({
      nom: [this.currentUser.nom || '', [Validators.required]],
      prenom: [this.currentUser.prenom || '', [Validators.required]],
      email: [this.currentUser.email || '', [Validators.required, Validators.email]],
      adresse: [this.currentUser.adresse || ''],
      tlf: [this.currentUser.tlf || '', [Validators.pattern('^[0-9 +()-]*$')]],
      mdp: ['']
    });
  }

  get profileTypeLabel(): string {
    switch (this.userType) {
      case 'CLIENT': return 'Client';
      case 'EXPERT': return 'Expert Agricole';
      case 'FOURNISSEUR': return 'Fournisseur';
      default: return 'Utilisateur';
    }
  }

  saveProfile(): void {
    if (!this.profileForm.valid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const values = { ...this.profileForm.value };
    if (!values.mdp) {
      delete values.mdp;
    }

    const payload = { id: this.currentUser.id, ...values };
    this.submitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const request$ =
      this.userType === 'CLIENT'
        ? this.service.updateClient(payload)
        : this.userType === 'EXPERT'
        ? this.service.updateExpert(payload)
        : this.service.updateFournisseur(payload);

    request$.subscribe({
      next: (updated) => {
        this.submitting = false;
        this.successMessage = 'Vos informations ont été mises à jour avec succès.';
        this.currentUser = updated;
        this.profileForm.patchValue({
          nom: updated.nom || '',
          prenom: updated.prenom || '',
          email: updated.email || '',
          adresse: updated.adresse || '',
          tlf: updated.tlf || '',
          mdp: ''
        });
      },
      error: (err) => {
        console.error(err);
        this.submitting = false;
        this.errorMessage = 'Impossible de mettre à jour le profil pour le moment. Réessayez plus tard.';
      }
    });
  }

  goHome(): void {
    this.router.navigate(['/listeBesoin']);
  }
}
