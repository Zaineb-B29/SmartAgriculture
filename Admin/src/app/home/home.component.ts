import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { forkJoin } from 'rxjs';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  totalAdmin: number = 0;
  totalClient: number = 0;
  totalExpert: number = 0;
  totalFournisseur: number = 0;

  myGroup: FormGroup;

  private percentageChart?: Chart;
  private timer: any;

  constructor(private router: Router, private service: CrudService) {
    this.myGroup = new FormGroup({
      firstName: new FormControl()
    });

    Chart.register(...registerables);
  }

  ngOnInit(): void {
   
    this.loadStats();
  
    this.timer = setInterval(() => {
      this.loadStats();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);

    
    if (this.percentageChart) {
      this.percentageChart.destroy();
      this.percentageChart = undefined;
    }
  }

  loadStats() {
    forkJoin({
      admins: this.service.getAdmin(),
      Clients: this.service.getClients(),
      Expert: this.service.getExperts(),
      Fournisseur: this.service.getFournisseurs()
    }).subscribe({
      next: ({ admins, Clients, Expert, Fournisseur }) => {
        this.totalAdmin = admins?.length || 0;
        this.totalClient = Clients?.length || 0;
        this.totalExpert = Expert?.length || 0;
        this.totalFournisseur = Fournisseur?.length || 0;

        this.renderOrUpdatePercentageChart();
      },
      error: (err) => {
        console.error('Erreur loadStats:', err);
      }
    });
  }
/* chart.js (ai)*/
  renderOrUpdatePercentageChart() {
    const total =
      this.totalAdmin +
      this.totalClient +
      this.totalExpert +
      this.totalFournisseur;

    const percentageAdmin = total ? (this.totalAdmin / total) * 100 : 0;
    const percentageClient = total ? (this.totalClient / total) * 100 : 0;
    const percentageExpert = total ? (this.totalExpert / total) * 100 : 0;
    const percentageFournisseur = total ? (this.totalFournisseur / total) * 100 : 0;

    if (this.percentageChart) {
      this.percentageChart.data.labels = [
        'Admin',
        'Client',
        'Expert',
        'Fournisseur'
      ];

      this.percentageChart.data.datasets[0].data = [
        percentageAdmin,
        percentageClient,
        percentageExpert,
        percentageFournisseur
      ];

      this.percentageChart.update();
      return;
    }
   
    this.percentageChart = new Chart('percentageCanvas', { /*id dans html*/
      type: 'pie', 
      data: {
        labels: ['Admin', 'Client', 'Expert', 'Fournisseur'],
        datasets: [{
          label: 'Pourcentage global',
          data: [
            percentageAdmin,
            percentageClient,
            percentageExpert,
            percentageFournisseur
          ],
          backgroundColor: [
            '#0d6efd',
            '#198754', 
            '#ffc107', 
            '#6f42c1'  
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Pourcentage Admin / Client / Expert / Fournisseur'
          },
          tooltip: {
            callbacks: {
label: (ctx) => `${ctx.label}: ${Number(ctx.raw)?.toFixed(1)} %`
            }
          }
        }
      }
    });
  }
}
