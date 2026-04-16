import { Component, OnInit } from '@angular/core';
import { CrudService } from '../service/crud.service';
import { Besoin } from '../Entites/Besoin.Entites';
import { PrixProposer } from '../Entites/PrixProposer.Entites';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-liste-besoins',
  templateUrl: './liste-besoin.component.html'
})
export class ListeBesoinComponent implements OnInit {

  besoins: Besoin[] = [];
  propositionsMap: { [key: number]: PrixProposer[] } = {};
  mesPropositions: PrixProposer[] = [];

  isFournisseurIn = false;
  isClientIn = false;
  isExpertIn = false;

  descriptions: { [key: number]: string } = {};

  reservedBesoinMap: { [besoinId: number]: number } = {};

  constructor(private service: CrudService) {}

  ngOnInit(): void {
    this.isFournisseurIn = this.service.isFournisseurIn();
    this.isClientIn = this.service.isClientIn();
    this.isExpertIn = this.service.isExpertIn();
    this.loadBesoins();
  }

  loadBesoins(): void {

    // CLIENT
    if (this.isClientIn) {
      this.service.getMesBesoins().subscribe(data => {
        this.besoins = data;

        this.besoins.forEach(b => {
          if (b.id) {
            this.service.getPrixByBesoin(b.id).subscribe(p => {
              this.propositionsMap[b.id!] = p;
            });
          }
        });

        this.loadMesReservations();
      });
    }

    // FOURNISSEUR
    if (this.isFournisseurIn) {
      this.service.getBesoinsValides().subscribe(data => {
      this.besoins = data;
    });

      this.service.getMesPropositions().subscribe(data => {
        this.mesPropositions = data;
      });
    }

    // EXPERT
    if (this.isExpertIn) {
      this.service.getBesoins().subscribe(data => {
        this.besoins = data;
      });
    }
  }

  // ===== EXPERT =====
  verify(besoinId: number) {
    const desc = this.descriptions[besoinId];

    if (!desc) {
      Swal.fire('Erreur', 'Description requise', 'warning');
      return;
    }

    this.service.verifyBesoin(besoinId, desc).subscribe({
      next: () => {
        Swal.fire('Validé', 'Besoin vérifié', 'success');
        this.loadBesoins();
      },
      error: (err) => {
        Swal.fire('Erreur', err.error || 'Erreur serveur', 'error');
      }
    });
  }

  // ===== CLIENT RESERVATION =====
  loadMesReservations(): void {
    const token = localStorage.getItem('myTokenClient');
    if (!token) return;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const clientId = payload.data.id;

    this.service.getMesReservations(clientId).subscribe(reservations => {
      this.reservedBesoinMap = {};
      reservations.forEach((r: any) => {
        const besoinId = r.prixProposer?.besoin?.id;
        const prixId = r.prixProposer?.id;
        if (besoinId && prixId) {
          this.reservedBesoinMap[besoinId] = prixId;
        }
      });
    });
  }

  isReserved(prixProposer: PrixProposer): boolean {
    const besoinId = prixProposer.besoin?.id;
    if (!besoinId) return false;
    return this.reservedBesoinMap[besoinId] === prixProposer.id;
  }

  besoinDejaReserve(besoinId: number): boolean {
    return !!this.reservedBesoinMap[besoinId];
  }

  // ===== FOURNISSEUR =====
  proposerPrix(besoin: Besoin): void {
    Swal.fire({
      title: 'Prix',
      input: 'number',
      inputPlaceholder: 'Entrer prix',
      showCancelButton: true
    }).then(result => {
      if (!result.value) return;

      const token = localStorage.getItem('myTokenFournisseur');
      const payload = JSON.parse(atob(token!.split('.')[1]));
      const fournisseurId = payload.data.id;

      this.service.proposerPrix(fournisseurId, besoin.id!, result.value).subscribe(() => {
        Swal.fire('Ajouté');
        this.loadBesoins();
      });
    });
  }

  reserver(prixProposer: PrixProposer): void {

    if (this.besoinDejaReserve(prixProposer.besoin?.id!)) {
      Swal.fire('Déjà réservé');
      return;
    }

    const token = localStorage.getItem('myTokenClient');
    const payload = JSON.parse(atob(token!.split('.')[1]));
    const clientId = payload.data.id;

    this.service.reserver(clientId, prixProposer.id!).subscribe({
      next: () => {
        this.reservedBesoinMap[prixProposer.besoin?.id!] = prixProposer.id!;
        Swal.fire('Réservé');
      },
      error: () => {
        Swal.fire('Erreur');
      }
    });
  }
}