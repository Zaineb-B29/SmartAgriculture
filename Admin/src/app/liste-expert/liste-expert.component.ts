import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ExpertAgricole } from '../Entites/ExpertAgricole.Entites';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-liste-expert',
  templateUrl: './liste-expert.component.html',
  styleUrls: ['./liste-expert.component.css']
})
export class ListeExpertComponent {

  listeExperts: ExpertAgricole[] = [];
  p:number=1;
  collection:any[];
  
  constructor(
    private service: CrudService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerExperts();
  }

  chargerExperts() {
    this.service.getExperts().subscribe({
      next: (experts) => {
        this.listeExperts = experts;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des experts:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger la liste des experts'
        });
      }
    });
  }

  deleteExpert(expert: ExpertAgricole) {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Voulez-vous vraiment supprimer l'expert "${expert.nom} ${expert.prenom}" ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.deleteExpert(expert.id!).subscribe({
          next: () => {
            this.listeExperts = this.listeExperts.filter(e => e.id !== expert.id);
            Swal.fire({
              icon: 'success',
              title: 'Supprimé !',
              text: 'L’expert a été supprimé avec succès.',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error(err);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Erreur lors de la suppression de l’expert'
            });
          }
        });
      }
    });
  }


  updateExpertEtat(expert: ExpertAgricole): void {
  const newEtat = !expert.etat;
  const message = newEtat ? 'activer' : 'désactiver';

  Swal.fire({
    title: 'Êtes-vous sûr ?',
    text: `Voulez-vous vraiment ${message} l'expert agricole "${expert.nom} ${expert.prenom}" ?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: newEtat ? '#28a745' : '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: `Oui, ${message}`,
    cancelButtonText: 'Annuler'
  }).then((result) => {
    if (result.isConfirmed) {
      expert.etat = newEtat;
      this.service.updateEtatExpert(expert.id, expert).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Succès !',
            text: `L'expert agricole a été ${message} avec succès.`,
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour:', err);
          expert.etat = !newEtat;
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: `Une erreur est survenue lors de la mise à jour du statut de l'expert agricole.`
          });
        }
      });
    }
  });
}
}
