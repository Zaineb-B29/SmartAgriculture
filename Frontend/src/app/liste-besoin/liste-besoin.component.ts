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

  // Fournisseur — all validated besoins
  besoins: Besoin[] = [];

  // Client + Expert — split lists
  besoinsValides: Besoin[]   = [];
  besoinsEnAttente: Besoin[] = [];

  // Prix per besoin (client view)
  propositionsMap: { [besoinId: number]: PrixProposer[] } = {};

  // All propositions by this fournisseur
  mesPropositions: PrixProposer[] = [];

  // Count of ALL propositions per besoin (fournisseur view)
  prixCountMap: { [besoinId: number]: number } = {};

  isFournisseurIn = false;
  isClientIn      = false;
  isExpertIn      = false;

  // besoinId → prixProposerId that is reserved
  reservedBesoinMap: { [besoinId: number]: number } = {};

  constructor(private service: CrudService) {}

  ngOnInit(): void {
    this.isFournisseurIn = this.service.isFournisseurIn();
    this.isClientIn      = this.service.isClientIn();
    this.isExpertIn      = this.service.isExpertIn();
    this.loadBesoins();
  }

  // ─────────────────────────────────────────────────────────────
  //  LOAD
  // ─────────────────────────────────────────────────────────────

  loadBesoins(): void {

    // ── CLIENT ──
    // We call TWO endpoints and merge:
    //   1. getMesBesoins()        → /besoin/client/:id  (may return only validated ones depending on backend)
    //   2. getMesBesoinsEnAttente()→ /besoin/client/:id/en-attente  (pending ones)
    // Then deduplicate by id so we never show a besoin twice.
    if (this.isClientIn) {
      forkJoin({
        validated: this.service.getMesBesoinsValides(),
        pending:   this.service.getMesBesoinsEnAttente()
      }).subscribe({
        next: ({ validated, pending }) => {
          this.besoinsValides   = validated;
          this.besoinsEnAttente = pending;

          // Load prices only for validated besoins
          this.besoinsValides.forEach(b => {
            if (b.id != null) {
              this.service.getPrixByBesoin(b.id).subscribe({
                next: (p: PrixProposer[]) => {
                  this.propositionsMap[b.id!] = p;
                },
                error: () => {
                  this.propositionsMap[b.id!] = [];
                }
              });
            }
          });

          this.loadMesReservations();
        },
        error: err => console.error('Erreur chargement besoins client', err)
      });
    }

    // ── FOURNISSEUR ──
    if (this.isFournisseurIn) {
      this.service.getBesoinsValides().subscribe({
        next: (data: Besoin[]) => {
          this.besoins = data;

          // For each besoin, load the total prix count
          this.besoins.forEach(b => {
            if (b.id != null) {
              this.service.getPrixByBesoin(b.id).subscribe({
                next: (prices: PrixProposer[]) => {
                  this.prixCountMap[b.id!] = prices.length;
                },
                error: () => {
                  this.prixCountMap[b.id!] = 0;
                }
              });
            }
          });
        },
        error: err => console.error('Erreur chargement besoins fournisseur', err)
      });

      // Load this fournisseur's own propositions
      this.service.getMesPropositions().subscribe({
        next: (data: PrixProposer[]) => {
          this.mesPropositions = data;
        },
        error: () => {
          this.mesPropositions = [];
        }
      });
    }

    // ── EXPERT ──
    if (this.isExpertIn) {
      this.service.getBesoinsEnAttente().subscribe({
        next: (data: Besoin[]) => {
          this.besoinsEnAttente = data;
        },
        error: err => console.error('Erreur chargement besoins en attente', err)
      });

      this.service.getBesoinsValides().subscribe({
        next: (data: Besoin[]) => {
          this.besoinsValides = data;
        },
        error: err => console.error('Erreur chargement besoins validés', err)
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  CLIENT — RESERVATIONS
  // ─────────────────────────────────────────────────────────────

  loadMesReservations(): void {
    const token = sessionStorage.getItem('myTokenClient');
    if (!token) return;
    try {
      const payload   = JSON.parse(atob(token.split('.')[1]));
      const clientId  = payload.data.id;
      this.service.getMesReservations(clientId).subscribe({
        next: (reservations: any[]) => {
          this.reservedBesoinMap = {};
          reservations.forEach((r: any) => {
            const besoinId = r.prixProposer?.besoin?.id;
            const prixId   = r.prixProposer?.id;
            if (besoinId != null && prixId != null) {
              this.reservedBesoinMap[besoinId] = prixId;
            }
          });
        },
        error: err => console.error('Erreur chargement réservations', err)
      });
    } catch (e) {
      console.error('Token invalide', e);
    }
  }

  isReserved(prixProposer: PrixProposer): boolean {
    const besoinId = prixProposer.besoin?.id;
    if (besoinId == null) return false;
    return this.reservedBesoinMap[besoinId] === prixProposer.id;
  }

  besoinDejaReserve(besoinId: number): boolean {
    return !!this.reservedBesoinMap[besoinId];
  }

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
    const payload  = JSON.parse(atob(token.split('.')[1]));
    const clientId = payload.data.id;

    this.service.reserver(clientId, prixProposer.id!).subscribe({
      next: () => {
        this.reservedBesoinMap[prixProposer.besoin?.id!] = prixProposer.id!;
        Swal.fire('Réservé', 'Réservation confirmée !', 'success');
      },
      error: () => Swal.fire('Erreur', 'Impossible d\'effectuer la réservation.', 'error')
    });
  }

  // ─────────────────────────────────────────────────────────────
  //  FOURNISSEUR — PRIX
  // ─────────────────────────────────────────────────────────────

  /** Returns how many total offers have been submitted for a besoin */
  getPrixCountForBesoin(besoinId: number): number {
    return this.prixCountMap[besoinId] ?? 0;
  }

  /** Returns true if this fournisseur already submitted a price for this besoin */
  aDejaPropose(besoinId: number): boolean {
    return this.mesPropositions.some(p => p.besoin?.id === besoinId);
  }

  /** Returns this fournisseur's submitted price for a given besoin */
  getMonPrix(besoinId: number): string | number | null {
    const prop = this.mesPropositions.find(p => p.besoin?.id === besoinId);
    return prop ? prop.Prix : null;
  }

  proposerPrix(besoin: Besoin): void {
    const existingPrix = this.aDejaPropose(besoin.id!) ? this.getMonPrix(besoin.id!) : null;

    Swal.fire({
      title: existingPrix ? 'Modifier votre prix' : 'Proposer un prix',
      html: `
        <div style="text-align:left; margin-bottom:8px;">
          <strong>${besoin.titre}</strong>
          ${existingPrix ? `<br><small style="color:#16a34a;">Votre prix actuel : <b>${existingPrix} TND</b></small>` : ''}
        </div>
      `,
      input: 'number',
      inputValue: existingPrix ?? '',
      inputPlaceholder: 'Entrez votre prix en TND',
      inputAttributes: { min: '0', step: '0.01' },
      showCancelButton: true,
      confirmButtonText: existingPrix ? 'Mettre à jour' : 'Envoyer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#4CAF50'
    }).then(result => {
      if (!result.value) return;

      const token = sessionStorage.getItem('myTokenFournisseur');
      if (!token) {
        Swal.fire('Erreur', 'Session expirée, veuillez vous reconnecter.', 'error');
        return;
      }
      const payload       = JSON.parse(atob(token.split('.')[1]));
      const fournisseurId = payload.data.id;

      this.service.proposerPrix(fournisseurId, besoin.id!, result.value).subscribe({
        next: () => {
          Swal.fire('Succès', existingPrix ? 'Prix mis à jour.' : 'Votre prix a été soumis.', 'success');
          this.loadBesoins();
        },
        error: (err) => Swal.fire('Erreur', err.error || 'Erreur serveur', 'error')
      });
    });
  }

  // ─────────────────────────────────────────────────────────────
  //  EXPERT — VALIDATION
  // ─────────────────────────────────────────────────────────────

  validerBesoin(besoin: Besoin): void {
    Swal.fire({
      title: 'Valider ce besoin',
      html: `
        <div style="text-align:left; margin-bottom:10px;">
          <strong>${besoin.titre}</strong>
        </div>
        <div style="text-align:left; margin-bottom:8px;">
          <label style="font-size:13px; font-weight:600; color:#334155;">
            Description expert
          </label>
        </div>
      `,
      input: 'textarea',
      inputPlaceholder: 'Rédigez votre analyse et recommandations...',
      showCancelButton: true,
      confirmButtonText: 'Valider',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#2563eb',
      inputValidator: (value) => {
        if (!value || value.trim().length < 5) {
          return 'Veuillez saisir une description (min 5 caractères).';
        }
        return null;
      }
    }).then(result => {
      if (!result.value) return;

      const user = this.service.userDetails();
      this.service.updateBesoinByExpert(
        besoin.id!,
        user.id,
        result.value,
        0
      ).subscribe({
        next: () => {
          Swal.fire('Validé !', 'Le besoin a été validé et mis à jour.', 'success');
          this.loadBesoins();
        },
        error: (err) => Swal.fire('Erreur', err.error || 'Erreur serveur', 'error')
      });
    });
  }

}