import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from '../service/crud.service';
import { Besoin } from '../Entites/Besoin.Entites';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-liste-besoin-en-attente',
  templateUrl: './liste-besoin-en-attente.component.html',
  styleUrls: ['./liste-besoin-en-attente.component.css']
})
export class ListeBesoinEnAttenteComponent implements OnInit {

  besoins: Besoin[] = [];
  descriptions: { [key: number]: string } = {};
  showFormMap:  { [key: number]: boolean } = {};

  constructor(
    private besoinService: CrudService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBesoins();
  }

  loadBesoins(): void {
    this.besoinService.getBesoinsEnAttente().subscribe({
      next: (data) => this.besoins = data,
      error: () => Swal.fire('Erreur', 'Impossible de charger les besoins', 'error')
    });
  }

  toggleForm(besoinId: number): void {
    this.showFormMap[besoinId] = !this.showFormMap[besoinId];
  }

  updateBesoin(besoin: Besoin): void {
    const id   = besoin.id!;
    const desc = this.descriptions[id];
    const user = this.besoinService.userDetails();

    if (!user) {
      Swal.fire('Non connecté', 'Veuillez vous reconnecter.', 'warning');
      return;
    }

    if (!desc || desc.trim() === '') {
      Swal.fire('Champ requis', 'Veuillez remplir la description expert.', 'warning');
      return;
    }

    // ✅ quantite removed — passing 0 as neutral value to satisfy the service signature
    // If you want to remove quantite from the backend too, remove it from updateBesoinByExpert()
    this.besoinService.updateBesoinByExpert(id, user.id, desc, 0).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Besoin validé avec succès !',
          timer: 1500,
          showConfirmButton: false
        }).then(() => this.loadBesoins());
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err?.error?.message || err?.error || 'Erreur serveur',
          showConfirmButton: true
        });
      }
    });
  }
}