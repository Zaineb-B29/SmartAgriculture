import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
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
  besoinsValides: Besoin[]   = [];
  besoinsEnAttente: Besoin[] = [];

  besoinsSansOffre: Besoin[] = [];
  besoinsAvecOffre: Besoin[] = [];
  besoinsReserves: Besoin[]  = [];

  propositionsMap: { [besoinId: number]: PrixProposer[] } = {};
  mesPropositions: PrixProposer[] = [];
  prixCountMap: { [besoinId: number]: number } = {};

  isFournisseurIn = false;
  isClientIn      = false;
  isExpertIn      = false;

  isLoading = false;

  suiviExistsMap: { [besoinId: number]: boolean } = {};
  suiviExistsMapFournis: { [besoinId: number]: boolean } = {};
  reservedBesoinMap: { [besoinId: number]: number } = {};
  reservedByClientMap: { [besoinId: number]: number } = {};

  openOffersMap: { [besoinId: number]: boolean } = {};

  constructor(private service: CrudService) {}

  ngOnInit(): void {
    this.isFournisseurIn = this.service.isFournisseurIn();
    this.isClientIn      = this.service.isClientIn();
    this.isExpertIn      = this.service.isExpertIn();
    this.loadBesoins();
  }

  // ================= LOAD =================

   loadBesoins(): void {
  this.isLoading = true;

  // CLIENT
  if (this.isClientIn) {
    // ✅ Read clientId FIRST, before forkJoin
    const clientToken = sessionStorage.getItem('myTokenClient');
    if (!clientToken) { this.isLoading = false; return; }
    const clientId: number = JSON.parse(atob(clientToken.split('.')[1])).data.id;

    forkJoin({
      validated: this.service.getMesBesoinsValides(),
      pending:   this.service.getMesBesoinsEnAttente()
    }).subscribe({
      next: ({ validated, pending }) => {
        this.besoinsValides   = validated;
        this.besoinsEnAttente = pending;

        this.besoinsValides
          .filter(b => b.id != null)
          .forEach(b =>
            this.service.getPrixByBesoin(b.id!).subscribe({
              next:  (p) => this.propositionsMap[b.id!] = p,
              error: ()  => this.propositionsMap[b.id!] = []
            })
          );

        this.loadMesReservations();
        this.loadSuiviExistsForClient(clientId); // ✅ now in scope
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  // FOURNISSEUR — unchanged
  if (this.isFournisseurIn) {
    const token = sessionStorage.getItem('myTokenFournisseur');
    if (!token) { this.isLoading = false; return; }

    const fournisseurId = JSON.parse(atob(token.split('.')[1])).data.id;

    forkJoin({
      besoins:      this.service.getBesoinsValides(),
      propositions: this.service.getMesPropositions(),
      reservations: this.service.getReservationsByFournisseur(fournisseurId)
    }).subscribe({
      next: ({ besoins, propositions, reservations }) => {
        this.besoins         = besoins;
        this.mesPropositions = propositions;

        this.reservedByClientMap = {};
        reservations.forEach((r: any) => {
          const besoinId = r.prixProposer?.besoin?.id;
          if (besoinId != null) this.reservedByClientMap[besoinId] = r.id;
        });

        this.splitBesoins();
        // ✅ Load which reserved besoins already have a suivi
        this.service.getSuivisByFournisseurId(fournisseurId).subscribe({
          next: (suivis: any[]) => {
            this.suiviExistsMapFournis = {};
            suivis.forEach(s => {
              const besoinId = s.reserver?.prixProposer?.besoin?.id;
              if (besoinId != null) {
                this.suiviExistsMapFournis[Number(besoinId)] = true;
              }
            });
          },
          error: () => {}
        });
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  // EXPERT — unchanged
  if (this.isExpertIn) {
    forkJoin({
      pending:   this.service.getBesoinsEnAttente(),
      validated: this.service.getBesoinsValides()
    }).subscribe({
      next: ({ pending, validated }) => {
        this.besoinsEnAttente = pending;
        this.besoinsValides   = validated;
        this.isLoading        = false;
      },
      error: () => this.isLoading = false
    });
  }
}

  // ================= SPLIT =================

  splitBesoins(): void {

    this.besoinsSansOffre = this.besoins.filter(b =>
      !this.aDejaPropose(b.id!) && !this.estReservePourBesoin(b.id!)
    );

    this.besoinsAvecOffre = this.besoins.filter(b =>
      this.aDejaPropose(b.id!) && !this.estReservePourBesoin(b.id!)
    );

    this.besoinsReserves = this.besoins.filter(b =>
      this.estReservePourBesoin(b.id!)
    );
  }

  // ================= CLIENT =================
  loadSuiviExistsForClient(clientId: number): void {
    this.service.getSuivisByClientId(clientId).subscribe({
      next: (suivis: any[]) => {
        this.suiviExistsMap = {};
        suivis.forEach(s => {
          const besoinId = s.reserver?.prixProposer?.besoin?.id;
          if (besoinId != null) {
            this.suiviExistsMap[Number(besoinId)] = true;
          }
        });
      },
      error: () => {} // silent — non-blocking
    });
  }
  loadMesReservations(): void {
    const token = sessionStorage.getItem('myTokenClient');
    if (!token) return;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const clientId = payload.data.id;

    this.service.getMesReservations(clientId).subscribe((res: any[]) => {
      this.reservedBesoinMap = {};
      res.forEach(r => {
        const besoinId = r.prixProposer?.besoin?.id;
        const prixId = r.prixProposer?.id;
        if (besoinId != null) {
          this.reservedBesoinMap[besoinId] = prixId;
        }
      });
    });
  }

  isReserved(p: PrixProposer): boolean {
    return this.reservedBesoinMap[p.besoin?.id!] === p.id;
  }

  besoinDejaReserve(id: number): boolean {
    return !!this.reservedBesoinMap[id];
  }

  reserver(p: PrixProposer): void {
    const token = sessionStorage.getItem('myTokenClient');
    if (!token) return;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const clientId = payload.data.id;

    this.service.reserver(clientId, p.id!).subscribe(() => {
      this.reservedBesoinMap[p.besoin?.id!] = p.id!;
      Swal.fire('Succès', 'Réservation confirmée', 'success');
    });
  }

  // ================= FOURNISSEUR =================

  aDejaPropose(id: number): boolean {
    return this.mesPropositions.some(p => p.besoin?.id === id);
  }

  getMonPrix(id: number): any {
    return this.mesPropositions.find(p => p.besoin?.id === id)?.Prix;
  }

  getPrixCountForBesoin(id: number): number {
    return this.prixCountMap[id] ?? 0;
  }

  estReservePourBesoin(id: number): boolean {
    return !!this.reservedByClientMap[id];
  }

  getReservationId(id: number): number {
    return this.reservedByClientMap[id] || 0;
  }

  proposerPrix(besoin: Besoin): void {
    Swal.fire({
      title: 'Proposer un prix',
      input: 'number',
      showCancelButton: true
    }).then(res => {
      if (!res.value) return;

      const token = sessionStorage.getItem('myTokenFournisseur');
      const payload = JSON.parse(atob(token!.split('.')[1]));
      const fournisseurId = payload.data.id;

      this.service.proposerPrix(fournisseurId, besoin.id!, res.value)
        .subscribe(() => this.loadBesoins());
    });
  }

  // ================= EXPERT FIX (🔥 YOUR ERROR FIXED HERE) =================

  validerBesoin(besoin: Besoin): void {
    this.service.validerBesoin(besoin.id!).subscribe({
      next: () => {
        Swal.fire('Succès', 'Besoin validé avec succès', 'success');
        this.loadBesoins();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Erreur', 'Impossible de valider le besoin', 'error');
      }
    });
  }

  // ================= SHARED =================

  toggleOffers(id: number): void {
    this.openOffersMap[id] = !this.openOffersMap[id];
  }

  supprimerBesoin(besoin: Besoin): void {
    this.service.deleteBesoin(besoin.id!).subscribe(() => this.loadBesoins());
  }
}