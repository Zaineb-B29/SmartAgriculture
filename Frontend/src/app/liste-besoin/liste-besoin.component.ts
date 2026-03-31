import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from '../service/crud.service';
import { Besoin } from '../Entites/Besoin.Entites';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-liste-besoins',
  templateUrl: './liste-besoin.component.html',
  styleUrls: ['./liste-besoin.component.css']
})
export class ListeBesoinComponent implements OnInit, OnDestroy {

  besoins: Besoin[] = [];
  isFournisseurIn: boolean = false;
  timer: any;

  constructor(private services: CrudService, private router: Router) {}

  ngOnInit(): void {
    const preloader = document.querySelector('.se-pre-con') as HTMLElement;
    if (preloader) {
      preloader.style.display = 'none';
    }

    this.isFournisseurIn = localStorage.getItem('type') === 'FOURNISSEUR';

    this.loadBesoins();
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  loadBesoins(): void {
    this.services.getBesoins().subscribe({
      next: (data) => {
        this.besoins = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  supprimerBesoin(id: number | undefined): void {
    if (!id) return;

    Swal.fire({
      title: 'Confirmer la suppression',
      text: 'Voulez-vous vraiment supprimer ce besoin ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.services.deleteBesoin(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: 'Besoin supprimé avec succès'
            });
            this.loadBesoins();
          },
          error: (err) => {
            console.error(err);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Suppression impossible'
            });
          }
        });
      }
    });
  }

  proposerPrix(besoin: Besoin): void {
    Swal.fire({
      title: 'Proposer un prix',
      html: `
        <p style="margin-bottom: 12px; color: #555;">
          Besoin : <strong>${besoin.titre}</strong>
        </p>
        <input
          id="swal-prix"
          type="number"
          min="0"
          class="swal2-input"
          placeholder="Entrez votre prix en TND"
        >
      `,
      showCancelButton: true,
      confirmButtonText: 'Envoyer ma proposition',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#4CAF50',
      focusConfirm: false,
      preConfirm: () => {
        const prixInput = document.getElementById('swal-prix') as HTMLInputElement;
        const prix = parseFloat(prixInput.value);
        if (!prixInput.value || isNaN(prix) || prix <= 0) {
          Swal.showValidationMessage('Veuillez entrer un prix valide supérieur à 0');
          return false;
        }
        return prixInput.value;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {

        // Extraire l'id fournisseur depuis le JWT stocké dans localStorage
        const token = localStorage.getItem('myTokenFournisseur');
        if (!token) {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Session expirée, veuillez vous reconnecter.'
          });
          return;
        }

        const payload = JSON.parse(atob(token.split('.')[1]));
        const fournisseurId = payload.data.id;

        this.services.proposerPrix(fournisseurId, besoin.id!, result.value).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Proposition envoyée !',
              text: `Votre prix de ${result.value} TND a été envoyé avec succès.`,
              confirmButtonColor: '#4CAF50'
            });
          },
          error: (err) => {
            console.error(err);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Impossible d\'envoyer votre proposition.'
            });
          }
        });
      }
    });
  }
}