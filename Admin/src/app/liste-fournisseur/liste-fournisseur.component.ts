import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Fournisseur } from '../Entites/Fournisseur.Entites';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-liste-fournisseur',
  templateUrl: './liste-fournisseur.component.html',
  styleUrls: ['./liste-fournisseur.component.css']
})
export class ListeFournisseurComponent {

  listeFournisseurs: Fournisseur[] = [];
  fournisseur: any;
  p:number=1;
  collection:any[];

  constructor(
    private service: CrudService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerFournisseurs();
  }

  chargerFournisseurs() {
    this.service.getFournisseurs().subscribe({
      next: (fournisseurs) => {
        this.listeFournisseurs = fournisseurs;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des fournisseurs:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger la liste des fournisseurs'
        });
      }
    });
  }

  deleteFournisseur(fournisseur: Fournisseur) {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Voulez-vous vraiment supprimer le fournisseur "${fournisseur.nom} ${fournisseur.prenom}" ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.deleteFournisseur(fournisseur.id!).subscribe({
          next: () => {
            this.listeFournisseurs = this.listeFournisseurs.filter(f => f.id !== fournisseur.id);
            Swal.fire({
              icon: 'success',
              title: 'Supprimé !',
              text: 'Le fournisseur a été supprimé avec succès.',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error(err);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Erreur lors de la suppression du fournisseur'
            });
          }
        });
      }
    });
  }
}
