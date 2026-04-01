import { Component, OnInit } from '@angular/core';
import { CrudService } from '../service/crud.service';
import { PrixProposer } from '../Entites/PrixProposer.Entites';

@Component({
  selector: 'app-mes-propositions',
  templateUrl: './mes-propositions.component.html'
})
export class MesPropositionsComponent implements OnInit {

  mesPropositions: PrixProposer[] = [];

  constructor(private service: CrudService) {}

  ngOnInit(): void {
    this.service.getMesPropositions().subscribe(data => {
      this.mesPropositions = data;
    });
  }
}