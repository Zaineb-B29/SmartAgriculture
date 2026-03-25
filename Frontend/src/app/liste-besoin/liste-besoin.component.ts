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
  timer: any;

  constructor(private services: CrudService, private router: Router) {}

  ngOnInit(): void {
    // hide preloader
    const preloader = document.querySelector('.se-pre-con') as HTMLElement;
    if (preloader) {
      preloader.style.display = 'none';
    }

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