import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from '../service/crud.service';
import { Besoin } from '../Entites/Besoin.Entites';
import { PrixProposer } from '../Entites/PrixProposer.Entites';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-suivi-evolution',
  templateUrl: './suivi-evolution.component.html',
  styleUrls: ['./suivi-evolution.component.css']
})
export class SuiviEvolutionComponent implements OnInit {

  besoin: Besoin | null = null;
  offresCount = 0;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: CrudService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || isNaN(id)) {
      this.router.navigate(['/listeBesoin']);
      return;
    }

    this.service.getBesoinById(id).pipe(
      switchMap((b: Besoin) => {
        this.besoin = b;
        return this.service.getPrixByBesoin(id);
      })
    ).subscribe({
      next: (p: PrixProposer[]) => {
        this.offresCount = p.length;
        this.isLoading = false;
      },
      error: () => {
        this.router.navigate(['/listeBesoin']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/listeBesoin']);
  }
}