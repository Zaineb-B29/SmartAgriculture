import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AjouterAdminComponent } from './ajouter-admin/ajouter-admin.component';
import { ListeAdminComponent } from './liste-admin/liste-admin.component';
import { LoginComponent } from './login/login.component';
import { ListeClientComponent } from './liste-client/liste-client.component';
import { AjouterClientComponent } from './ajouter-client/ajouter-client.component';
import { ListeFournisseurComponent } from './liste-fournisseur/liste-fournisseur.component';
import { AjouterFournisseurComponent } from './ajouter-fournisseur/ajouter-fournisseur.component';
import { ListeExpertComponent } from './liste-expert/liste-expert.component';
import { AjouterExpertComponent } from './ajouter-expert/ajouter-expert.component';

const routes: Routes = [
  {path: '', component: AjouterAdminComponent},
  {path: 'listeAdmin', component: ListeAdminComponent},
  { path: 'ajouterClient', component: AjouterClientComponent},
  {path: 'listeClient', component: ListeClientComponent},
  {path: 'login', component: LoginComponent},
  { path: 'ajouterExpert', component: AjouterExpertComponent },
  { path: 'listeExpert', component: ListeExpertComponent },
  { path: 'ajouterFournisseur', component: AjouterFournisseurComponent },
  { path: 'listeFournisseur', component: ListeFournisseurComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
