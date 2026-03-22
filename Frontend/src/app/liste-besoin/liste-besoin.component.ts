import { Component, OnInit } from '@angular/core';
import { CrudService } from '../service/crud.service';
import { Besoin } from '../Entites/Besoin.Entites';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-liste-besoins',
  templateUrl: './liste-besoin.component.html',
  styleUrls: ['./liste-besoin.component.css']
})
export class ListeBesoinComponent implements OnInit {

  besoins: Besoin[] = [];

  constructor(private services: CrudService) {}

  ngOnInit(): void {
    this.loadBesoins();
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
    if (!id) {
      return;
    }

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
}