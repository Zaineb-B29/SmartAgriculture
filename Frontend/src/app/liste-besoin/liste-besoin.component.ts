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

  isFournisseurIn = false;
  isClientIn = false;

  mesPropositions: PrixProposer[] = [];

  constructor(private service: CrudService) {}

  ngOnInit(): void {
    this.isFournisseurIn = this.service.isFournisseurIn();
    this.isClientIn = this.service.isClientIn();

    this.loadBesoins();
  }

  loadBesoins(): void {

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
      });
    }

    if (this.isFournisseurIn) {
      this.service.getBesoins().subscribe(data => {
        this.besoins = data;
      });

      this.service.getMesPropositions().subscribe(data => {
        this.mesPropositions = data;
      });
    }
  }

  // 🔥 IMPORTANT: check if fournisseur already proposed
  getMyProposition(besoinId: number): PrixProposer | undefined {
    return this.mesPropositions.find(p => p.besoin?.id === besoinId);
  }

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

        // 🔥 reload immediately
        this.loadBesoins();

      });

    });
  }
}