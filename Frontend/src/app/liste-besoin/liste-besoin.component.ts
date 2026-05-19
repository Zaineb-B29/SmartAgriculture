import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  showFormMap:  { [key: number]: boolean } = {};
  descriptions: { [key: number]: string }  = {};
  quantites:    { [key: number]: number }  = {};
  // ── Data ─────────────────────────────────────────────
  besoins: Besoin[]          = [];
  besoinsValides: Besoin[]   = [];
  besoinsEnAttente: Besoin[] = [];

  besoinsSansOffre: Besoin[] = [];
  besoinsAvecOffre: Besoin[] = [];
  besoinsReserves: Besoin[]  = [];

  propositionsMap: { [besoinId: number]: PrixProposer[] } = {};
  mesPropositions: PrixProposer[] = [];
  prixCountMap:    { [besoinId: number]: number }  = {};

  // ── Role flags ───────────────────────────────────────
  isFournisseurIn = false;
  isClientIn      = false;
  isExpertIn      = false;
  isLoading       = false;

  // ── Suivi maps ───────────────────────────────────────
  suiviExistsMap:       { [besoinId: number]: boolean } = {};
  suiviExistsMapFournis:{ [besoinId: number]: boolean } = {};

  // ── Reservation maps ─────────────────────────────────
  reservedBesoinMap:      { [besoinId: number]: number } = {}; // besoinId → prixId
  reservedByClientMap:    { [besoinId: number]: number } = {}; // besoinId → reservationId
  reservedFournisseurMap: { [besoinId: number]: number } = {}; // besoinId → fournisseurId (client side)
  reservedClientMap:      { [besoinId: number]: number } = {}; // besoinId → clientId (fournisseur side)

  // ── UI state ─────────────────────────────────────────
  openOffersMap: { [besoinId: number]: boolean } = {};

  constructor(
    private service: CrudService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isFournisseurIn = this.service.isFournisseurIn();
    this.isClientIn      = this.service.isClientIn();
    this.isExpertIn      = this.service.isExpertIn();
    this.loadBesoins();
  }

  // ═══════════════════════════════════════════════════════
  //  LOAD
  // ═══════════════════════════════════════════════════════

  loadBesoins(): void {
    this.isLoading = true;

    // ── CLIENT ─────────────────────────────────────────
    if (this.isClientIn) {
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
          this.loadSuiviExistsForClient(clientId);
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    }

    // ── FOURNISSEUR ────────────────────────────────────
    if (this.isFournisseurIn) {
      const token = sessionStorage.getItem('myTokenFournisseur');
      if (!token) { this.isLoading = false; return; }
      const fournisseurId: number = JSON.parse(atob(token.split('.')[1])).data.id;

      forkJoin({
        besoins:      this.service.getBesoinsValides(),
        propositions: this.service.getMesPropositions(),
        reservations: this.service.getReservationsByFournisseur(fournisseurId)
      }).subscribe({
        next: ({ besoins, propositions, reservations }) => {
          this.besoins         = besoins;
          this.mesPropositions = propositions;

          // Build reservation maps
          this.reservedByClientMap = {};
          this.reservedClientMap   = {};
          reservations.forEach((r: any) => {
            const besoinId = r.prixProposer?.besoin?.id;
            const clientId = r.client?.id;
            if (besoinId != null) {
              this.reservedByClientMap[besoinId] = r.id;       // reservationId
              this.reservedClientMap[besoinId]   = clientId;   // ✅ clientId for messaging
            }
          });

          this.splitBesoins();

          // Load suivi exists map for fournisseur
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

    // ── EXPERT ─────────────────────────────────────────
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

  // ═══════════════════════════════════════════════════════
  //  SPLIT (fournisseur)
  // ═══════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════
  //  CLIENT METHODS
  // ═══════════════════════════════════════════════════════

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
      error: () => {}
    });
  }

  loadMesReservations(): void {
    const token = sessionStorage.getItem('myTokenClient');
    if (!token) return;
    const clientId: number = JSON.parse(atob(token.split('.')[1])).data.id;

    this.service.getMesReservations(clientId).subscribe((res: any[]) => {
      this.reservedBesoinMap      = {};
      this.reservedFournisseurMap = {};

      res.forEach(r => {
        const besoinId      = r.prixProposer?.besoin?.id;
        const prixId        = r.prixProposer?.id;
        const fournisseurId = r.prixProposer?.fournisseur?.id;

        if (besoinId != null) {
          this.reservedBesoinMap[besoinId]      = prixId;        // for isReserved check
          this.reservedFournisseurMap[besoinId] = fournisseurId; // ✅ for messaging
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
    const clientId: number = JSON.parse(atob(token.split('.')[1])).data.id;

    this.service.reserver(clientId, p.id!).subscribe(() => {
      const besoinId = p.besoin?.id!;

      this.reservedBesoinMap[besoinId]      = p.id!;
      this.reservedFournisseurMap[besoinId] = p.fournisseur?.id!; // ✅ ligne manquante

      Swal.fire('Succès', 'Réservation confirmée', 'success');
    });
  }

  getUserIdClient(): number {
    try {
      const token = sessionStorage.getItem('myTokenClient');
      if (!token) return 0;
      return JSON.parse(atob(token.split('.')[1])).data.id;
    } catch { return 0; }
  }

  // ═══════════════════════════════════════════════════════
  //  FOURNISSEUR METHODS
  // ═══════════════════════════════════════════════════════

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
    const aiSection = (besoin.maladie || besoin.niveauRisque || besoin.recommandations) ? `
      <div style="margin-top:16px; background:#f0fdf4; border:1px solid #86efac;
                  border-radius:10px; padding:14px; text-align:left;">
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:10px;">
          <i class="fas fa-robot" style="color:#16a34a; font-size:13px;"></i>
          <span style="font-size:11px; font-weight:700; color:#15803d;
                      text-transform:uppercase; letter-spacing:.05em;">
            Diagnostic IA
          </span>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
          <span style="background:#dcfce7; color:#15803d; border-radius:20px;
                      padding:3px 10px; font-size:12px; font-weight:600;
                      display:flex; align-items:center; gap:4px;">
            <i class="fas fa-bug" style="font-size:10px;"></i>
            ${besoin.maladie || 'Non déterminée'}
          </span>
          <span style="background:${besoin.niveauRisque === 'élevé' ? '#fee2e2' : besoin.niveauRisque === 'faible' ? '#dcfce7' : '#fef9c3'};
                      color:${besoin.niveauRisque === 'élevé' ? '#dc2626' : besoin.niveauRisque === 'faible' ? '#15803d' : '#92400e'};
                      border-radius:20px; padding:3px 10px; font-size:12px; font-weight:600;
                      display:flex; align-items:center; gap:4px;">
            <i class="fas fa-exclamation-triangle" style="font-size:10px;"></i>
            Risque : ${besoin.niveauRisque || 'moyen'}
          </span>
        </div>
        ${besoin.recommandations ? `
          <div>
            <p style="font-size:10px; font-weight:600; color:#64748b;
                      text-transform:uppercase; margin:0 0 4px;">
              Recommandations IA
            </p>
            <p style="font-size:12px; color:#475569; margin:0; line-height:1.5;">
              ${besoin.recommandations}
            </p>
          </div>` : ''}
      </div>
    ` : `
      <div style="margin-top:16px; background:#f8fafc; border:1px solid #e2e8f0;
                  border-radius:10px; padding:12px; text-align:center;">
        <i class="fas fa-robot" style="color:#cbd5e1; font-size:20px;"></i>
        <p style="font-size:12px; color:#94a3b8; margin:6px 0 0;">
          Aucune analyse IA disponible pour ce besoin.
        </p>
      </div>
    `;

    Swal.fire({
      title: `<div style="display:flex; align-items:center; gap:10px; font-size:17px;">
                <i class="fas fa-tag" style="color:#4CAF50;"></i>
                Proposer un prix
              </div>`,
      html: `
        <div style="text-align:left; font-size:13px; color:#475569; margin-bottom:12px;">
          <strong style="color:#1e293b;">${besoin.titre}</strong>
        </div>

        <hr style="border:none; border-top:1px solid #e2e8f0; margin:0 0 16px;">

        ${aiSection}

        <div style="margin-top:16px;">
          <label style="font-size:11px; font-weight:600; color:#64748b;
                        text-transform:uppercase; letter-spacing:.04em;
                        display:flex; align-items:center; gap:5px; margin-bottom:6px;">
            <i class="fas fa-coins" style="color:#4CAF50;"></i>
            Votre prix proposé (TND)
          </label>
          <div style="position:relative;">
            <input
              id="swal-prix"
              type="number"
              min="0"
              step="0.01"
              placeholder="Ex: 350.00"
              style="width:100%; font-size:14px; font-weight:600; padding:10px 48px 10px 12px;
                    border-radius:8px; border:1px solid #e2e8f0; color:#1e293b;
                    box-sizing:border-box; outline:none; font-family:inherit;" />
            <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%);
                        font-size:13px; font-weight:600; color:#94a3b8;">TND</span>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-check-circle"></i> Soumettre',
      cancelButtonText:  '<i class="fas fa-times"></i> Annuler',
      confirmButtonColor: '#4CAF50',
      cancelButtonColor:  '#94a3b8',
      width: '560px',
      preConfirm: () => {
        const val = (document.getElementById('swal-prix') as HTMLInputElement)?.value?.trim();
        if (!val || isNaN(Number(val)) || Number(val) <= 0) {
          Swal.showValidationMessage('⚠️ Veuillez saisir un prix valide supérieur à 0.');
          return false;
        }
        return Number(val);
      }
    }).then(result => {
      if (!result.isConfirmed) return;

      const token = sessionStorage.getItem('myTokenFournisseur');
      if (!token) return;
      const fournisseurId: number = JSON.parse(atob(token.split('.')[1])).data.id;

      this.service.proposerPrix(fournisseurId, besoin.id!, result.value).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Prix soumis !',
            text: `Votre offre de ${result.value} TND a été envoyée avec succès.`,
            timer: 1800,
            showConfirmButton: false
          }).then(() => this.loadBesoins());
        },
        error: (err) => {
          Swal.fire('Erreur', err?.error?.message || 'Erreur lors de la soumission.', 'error');
        }
      });
    });
  }

  getUserIdFournisseur(): number {
    try {
      const token = sessionStorage.getItem('myTokenFournisseur');
      if (!token) return 0;
      return JSON.parse(atob(token.split('.')[1])).data.id;
    } catch { return 0; }
  }

  // ═══════════════════════════════════════════════════════
  //  EXPERT METHODS
  // ═══════════════════════════════════════════════════════

      

      validerBesoin(besoin: Besoin): void {
        const id   = besoin.id!;
        const user = this.service.userDetails();

        // Build AI section HTML based on available data
        const aiSection = (besoin.maladie || besoin.niveauRisque || besoin.recommandations) ? `
          <div style="margin-top:16px; background:#f0fdf4; border:1px solid #86efac;
                      border-radius:10px; padding:14px; text-align:left;">
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:10px;">
              <i class="fas fa-robot" style="color:#16a34a; font-size:13px;"></i>
              <span style="font-size:11px; font-weight:700; color:#15803d;
                          text-transform:uppercase; letter-spacing:.05em;">
                Diagnostic IA
              </span>
            </div>

            <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
              <span style="background:#dcfce7; color:#15803d; border-radius:20px;
                          padding:3px 10px; font-size:12px; font-weight:600;
                          display:flex; align-items:center; gap:4px;">
                <i class="fas fa-bug" style="font-size:10px;"></i>
                ${besoin.maladie || 'Non déterminée'}
              </span>
              <span style="background:${besoin.niveauRisque === 'élevé' ? '#fee2e2' : besoin.niveauRisque === 'faible' ? '#dcfce7' : '#fef9c3'};
                          color:${besoin.niveauRisque === 'élevé' ? '#dc2626' : besoin.niveauRisque === 'faible' ? '#15803d' : '#92400e'};
                          border-radius:20px; padding:3px 10px; font-size:12px; font-weight:600;
                          display:flex; align-items:center; gap:4px;">
                <i class="fas fa-exclamation-triangle" style="font-size:10px;"></i>
                Risque : ${besoin.niveauRisque || 'moyen'}
              </span>
            </div>

            ${besoin.analyseImage ? `
              <div style="margin-bottom:8px;">
                <p style="font-size:10px; font-weight:600; color:#64748b;
                          text-transform:uppercase; margin:0 0 4px;">
                  Observation visuelle
                </p>
                <p style="font-size:12px; color:#475569; margin:0; line-height:1.5;">
                  ${besoin.analyseImage}
                </p>
              </div>` : ''}

            <div>
              <p style="font-size:10px; font-weight:600; color:#64748b;
                        text-transform:uppercase; margin:0 0 4px;">
                Recommandations IA
              </p>
              <p style="font-size:12px; color:#475569; margin:0; line-height:1.5;">
                ${besoin.recommandations || 'Aucune recommandation disponible.'}
              </p>
            </div>
          </div>
        ` : `
          <div style="margin-top:16px; background:#f8fafc; border:1px solid #e2e8f0;
                      border-radius:10px; padding:12px; text-align:center;">
            <i class="fas fa-robot" style="color:#cbd5e1; font-size:20px;"></i>
            <p style="font-size:12px; color:#94a3b8; margin:6px 0 0;">
              Aucune analyse IA disponible pour ce besoin.
            </p>
          </div>
        `;

        Swal.fire({
          title: `<div style="display:flex; align-items:center; gap:10px; font-size:17px;">
                    <i class="fas fa-leaf" style="color:#4CAF50;"></i>
                    Validation du besoin
                  </div>`,
          html: `
            <div style="text-align:left; font-size:13px; color:#475569; margin-bottom:12px;">
              <strong style="color:#1e293b;">${besoin.titre}</strong>
            </div>

            <hr style="border:none; border-top:1px solid #e2e8f0; margin:0 0 16px;">

            <!-- AI Diagnostic section -->
            ${aiSection}

            <!-- Description Expert -->
            <div style="margin-top:16px;">
              <label style="font-size:11px; font-weight:600; color:#64748b;
                            text-transform:uppercase; letter-spacing:.04em;
                            display:flex; align-items:center; gap:5px; margin-bottom:6px;">
                <i class="fas fa-comment-medical" style="color:#4CAF50;"></i>
                Votre description / correction
              </label>
              <textarea id="swal-desc"
                        placeholder="Confirmez, corrigez ou complétez le diagnostic IA..."
                        rows="4"
                        style="width:100%; font-size:13px; padding:10px 12px;
                              border-radius:8px; border:1px solid #e2e8f0;
                              resize:vertical; font-family:inherit; color:#1e293b;
                              box-sizing:border-box; outline:none;">${besoin.recommandations || ''}</textarea>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: '<i class="fas fa-check-circle"></i> Confirmer',
          cancelButtonText:  '<i class="fas fa-times"></i> Annuler',
          confirmButtonColor: '#4CAF50',
          cancelButtonColor:  '#94a3b8',
          width: '560px',
          preConfirm: () => {
            const desc = (document.getElementById('swal-desc') as HTMLTextAreaElement)?.value?.trim();
            if (!desc) {
              Swal.showValidationMessage('⚠️ Veuillez remplir la description expert.');
              return false;
            }
            return { desc };
          }
        }).then(result => {
          if (!result.isConfirmed) return;
          const desc = result.value.desc;

          this.service.updateBesoinByExpert(id, user.id, desc, 0).subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Besoin validé !',
                timer: 1500,
                showConfirmButton: false
              }).then(() => this.loadBesoins());
            },
            error: (err) => {
              Swal.fire('Erreur', err?.error?.message || 'Erreur serveur', 'error');
            }
          });
        });
      }

  // ═══════════════════════════════════════════════════════
  //  MESSAGING
  // ═══════════════════════════════════════════════════════

  ouvrirMessage(myType: string, myId: number, otherType: string, otherId: number): void {
    if (!otherId) {
      Swal.fire('Erreur', 'Impossible d\'ouvrir la conversation.', 'error');
      return;
    }
    this.router.navigate(['/message'], {
      queryParams: { myType, myId, otherType, otherId }
    });
  }

  // ═══════════════════════════════════════════════════════
  //  SHARED
  // ═══════════════════════════════════════════════════════

  toggleOffers(id: number): void {
    this.openOffersMap[id] = !this.openOffersMap[id];
  }

  supprimerBesoin(besoin: Besoin): void {
    this.service.deleteBesoin(besoin.id!).subscribe(() => this.loadBesoins());
  }


  // Add these alongside your other maps


toggleForm(id: number): void {
  this.showFormMap[id] = !this.showFormMap[id];
}

}