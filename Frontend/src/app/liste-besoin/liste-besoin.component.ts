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

  //affichage de validation de besoins pour fournisseur et client
  openOffersMap: { [besoinId: number]: boolean } = {};

  toggleOffers(besoinId: number): void {
    this.openOffersMap[besoinId] = !this.openOffersMap[besoinId];
  }


  supprimerBesoin(besoin: Besoin): void {
  Swal.fire({
    title: 'Supprimer ce besoin ?',
    text: `"${besoin.titre}" sera définitivement supprimé.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonText: 'Annuler',
    confirmButtonText: 'Supprimer'
  }).then(result => {
    if (!result.isConfirmed) return;
    this.service.deleteBesoin(besoin.id!).subscribe({
      next: () => {
        Swal.fire('Supprimé', 'Le besoin a été supprimé.', 'success');
        this.loadBesoins();
      },
      error: () => Swal.fire('Erreur', 'Impossible de supprimer ce besoin.', 'error')
    });
  });
  }

  modifierBesoin(besoin: Besoin): void {
    Swal.fire({
      title: 'Modifier le besoin',
      html: `
        <div style="text-align:left; display:flex; flex-direction:column; gap:10px;">
          <div>
            <label style="font-size:12px; font-weight:600; color:#475569;">Titre</label>
            <input id="swal-titre" class="swal2-input" value="${besoin.titre}" placeholder="Titre" style="margin:4px 0;">
          </div>
          <div>
            <label style="font-size:12px; font-weight:600; color:#475569;">Description</label>
            <textarea id="swal-desc" class="swal2-textarea" placeholder="Description" style="margin:4px 0;">${besoin.description}</textarea>
          </div>
          <div style="display:flex; gap:8px;">
            <div style="flex:1;">
              <label style="font-size:12px; font-weight:600; color:#475569;">Nombre d'arbres</label>
              <input id="swal-arbres" class="swal2-input" value="${besoin.nombreArbres}" placeholder="Nb arbres" style="margin:4px 0;">
            </div>
            <div style="flex:1;">
              <label style="font-size:12px; font-weight:600; color:#475569;">Lieu</label>
              <input id="swal-lieu" class="swal2-input" value="${besoin.lieu}" placeholder="Lieu" style="margin:4px 0;">
            </div>
          </div>
          <div>
            <label style="font-size:12px; font-weight:600; color:#475569;">Métrage</label>
            <input id="swal-metrage" class="swal2-input" value="${besoin.metrage}" placeholder="Métrage" style="margin:4px 0;">
          </div>
          <div>
            <label style="font-size:12px; font-weight:600; color:#475569;">Nouvelle image (optionnel)</label>
            <input id="swal-image" type="file" class="swal2-input" style="margin:4px 0; padding:6px;">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Enregistrer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#4CAF50',
      width: '520px',
      preConfirm: () => {
        const titre      = (document.getElementById('swal-titre') as HTMLInputElement).value.trim();
        const desc       = (document.getElementById('swal-desc') as HTMLTextAreaElement).value.trim();
        const arbres     = (document.getElementById('swal-arbres') as HTMLInputElement).value.trim();
        const lieu       = (document.getElementById('swal-lieu') as HTMLInputElement).value.trim();
        const metrage    = (document.getElementById('swal-metrage') as HTMLInputElement).value.trim();
        const fileInput  = document.getElementById('swal-image') as HTMLInputElement;
        const file       = fileInput.files?.[0] ?? null;

        if (!titre || !desc || !arbres || !lieu || !metrage) {
          Swal.showValidationMessage('Tous les champs sont obligatoires.');
          return false;
        }
        return { titre, desc, arbres, lieu, metrage, file };
      }
    }).then(result => {
      if (!result.isConfirmed || !result.value) return;

      const { titre, desc, arbres, lieu, metrage, file } = result.value;
      const formData = new FormData();
      formData.append('titre', titre);
      formData.append('description', desc);
      formData.append('nombreArbres', arbres);
      formData.append('lieu', lieu);
      formData.append('metrage', metrage);
      if (file) formData.append('image', file);

      this.service.updateBesoin(besoin.id!, formData).subscribe({
        next: () => {
          Swal.fire('Modifié', 'Le besoin a été mis à jour.', 'success');
          this.loadBesoins();
        },
        error: () => Swal.fire('Erreur', 'Impossible de modifier ce besoin.', 'error')
      });
    });
  }



  suivreEvolution(besoin: Besoin): void {
  const offresCount = this.propositionsMap[besoin.id!]?.length ?? 0;
  const expertName  = besoin.expert
    ? `${besoin.expert.nom} ${besoin.expert.prenom}`
    : 'N/A';
  const dateVal = besoin.dateValidationExpert
    ? new Date(besoin.dateValidationExpert).toLocaleDateString('fr-FR')
    : 'N/A';

  Swal.fire({
    title: `<i class="fas fa-chart-line" style="color:#2563eb;margin-right:8px;"></i>Évolution du besoin`,
    html: `
      <div style="text-align:left; font-size:13px; line-height:2;">
        <p><strong>📌 Titre :</strong> ${besoin.titre}</p>
        <p><strong>👨‍🌾 Expert validateur :</strong> ${expertName}</p>
        <p><strong>📅 Date de validation :</strong> ${dateVal}</p>
        <p><strong>📝 Analyse expert :</strong><br>
          <span style="color:#475569; font-style:italic;">
            ${besoin.descriptionExpert ?? 'Aucune analyse disponible'}
          </span>
        </p>
        <hr style="margin:10px 0; border-color:#e2e8f0;">
        <p><strong>🏷️ Offres fournisseurs reçues :</strong>
          <span style="background:#dcfce7; color:#16a34a; border-radius:20px; padding:2px 10px; font-weight:600; margin-left:6px;">
            ${offresCount}
          </span>
        </p>
        <p style="color:${offresCount > 0 ? '#16a34a' : '#f59e0b'}; font-weight:500;">
          ${offresCount > 0
            ? '✅ Des fournisseurs ont soumis des offres. Consultez-les ci-dessous.'
            : '⏳ En attente d\'offres des fournisseurs.'}
        </p>
      </div>
    `,
    confirmButtonText: 'Fermer',
    confirmButtonColor: '#2563eb',
    width: '480px'
  });
}


}