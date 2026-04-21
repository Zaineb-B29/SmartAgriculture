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

  // Fournisseur / Expert — all validated
  besoins: Besoin[] = [];

  // Client — split into two lists
  besoinsValides: Besoin[]    = [];
  besoinsEnAttente: Besoin[]  = [];

  propositionsMap: { [key: number]: PrixProposer[] } = {};
  mesPropositions: PrixProposer[] = [];

  isFournisseurIn = false;
  isClientIn      = false;
  isExpertIn      = false;

  descriptions: { [key: number]: string } = {};
  reservedBesoinMap: { [besoinId: number]: number } = {};

  constructor(private service: CrudService) {}

  ngOnInit(): void {
    this.isFournisseurIn = this.service.isFournisseurIn();
    this.isClientIn      = this.service.isClientIn();
    this.isExpertIn      = this.service.isExpertIn();
    this.loadBesoins();
  }

  loadBesoins(): void {

    // ── CLIENT ──
    if (this.isClientIn) {
      this.service.getMesBesoins().subscribe(data => {
        // Split into validated and non-validated
        this.besoinsValides   = data.filter(b => b.etat === true);
        this.besoinsEnAttente = data.filter(b => b.etat === false || b.etat == null);

        // Load prix for validated besoins only
        this.besoinsValides.forEach(b => {
          if (b.id) {
            this.service.getPrixByBesoin(b.id).subscribe(p => {
              this.propositionsMap[b.id!] = p;
            });
          }
        });

        this.loadMesReservations();
      });
    }

    // ── FOURNISSEUR — only validated ──
    if (this.isFournisseurIn) {
      this.service.getBesoinsValides().subscribe(data => {
        this.besoins = data;
      });
      this.service.getMesPropositions().subscribe(data => {
        this.mesPropositions = data;
      });
    }

    if (this.isExpertIn) {

      // 🔹 besoins en attente (important for validation)
      this.service.getBesoinsEnAttente().subscribe(data => {
        this.besoinsEnAttente = data;
      });

      // 🔹 besoins validés (optional but useful)
      this.service.getBesoinsValides().subscribe(data => {
        this.besoinsValides = data;
      });

    }
  }

  // ===== CLIENT — RESERVATIONS =====
  loadMesReservations(): void {
    const token = sessionStorage.getItem('myTokenClient');
    if (!token) return;
    const payload = JSON.parse(atob(token.split('.')[1]));
    const clientId = payload.data.id;

    this.service.getMesReservations(clientId).subscribe(reservations => {
      this.reservedBesoinMap = {};
      reservations.forEach((r: any) => {
        const besoinId = r.prixProposer?.besoin?.id;
        const prixId   = r.prixProposer?.id;
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
      title: 'Proposer un prix',
      input: 'number',
      inputPlaceholder: 'Entrez votre prix en TND',
      showCancelButton: true,
      confirmButtonText: 'Envoyer',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (!result.value) return;

      const token = sessionStorage.getItem('myTokenFournisseur');
      if (!token) {
        Swal.fire('Erreur', 'Session expirée, veuillez vous reconnecter.', 'error');
        return;
      }
      const payload = JSON.parse(atob(token.split('.')[1]));
      const fournisseurId = payload.data.id;

      this.service.proposerPrix(fournisseurId, besoin.id!, result.value).subscribe({
        next: () => {
          Swal.fire('Ajouté', 'Votre prix a été soumis.', 'success');
          this.loadBesoins();
        },
        error: (err) => Swal.fire('Erreur', err.error || 'Erreur serveur', 'error')
      });
    });
  }

  // ===== CLIENT — RESERVATION =====
  reserver(prixProposer: PrixProposer): void {
    if (this.besoinDejaReserve(prixProposer.besoin?.id!)) {
      Swal.fire('Info', 'Vous avez déjà une réservation pour ce besoin.', 'info');
      return;
    }

    const token = sessionStorage.getItem('myTokenClient');
    if (!token) {
      Swal.fire('Erreur', 'Session expirée, veuillez vous reconnecter.', 'error');
      return;
    }
    const payload = JSON.parse(atob(token.split('.')[1]));
    const clientId = payload.data.id;

    this.service.reserver(clientId, prixProposer.id!).subscribe({
      next: () => {
        this.reservedBesoinMap[prixProposer.besoin?.id!] = prixProposer.id!;
        Swal.fire('Réservé', 'Réservation confirmée !', 'success');
      },
      error: () => Swal.fire('Erreur', 'Impossible d\'effectuer la réservation.', 'error')
    });
  }
}