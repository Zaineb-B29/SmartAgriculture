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
import { AuthGuard } from './service/Auth.service';
import { ModifierAdminComponent } from './modifier-admin/modifier-admin.component';
import { ModifierClientComponent } from './modifier-client/modifier-client.component';
import { ModifierFournisseurComponent } from './modifier-fournisseur/modifier-fournisseur.component';
import { ModifierExpertComponent } from './modifier-expert/modifier-expert.component';
import { HomeComponent } from './home/home.component';
import { ProfilComponent } from './profil/profil.component';
import { UpdateProfilComponent } from './update-profil/update-profil.component';

const routes: Routes = [
  {path: 'ajouterAdmin', component: AjouterAdminComponent,canActivate: [AuthGuard]},
  {path: 'listeAdmin', component: ListeAdminComponent,canActivate: [AuthGuard]},
  { path: 'ajouterClient', component: AjouterClientComponent,canActivate: [AuthGuard]}, 
  {path: 'listeClient', component: ListeClientComponent,canActivate: [AuthGuard]},
  {path: '', component: LoginComponent},
  { path: 'ajouterExpert', component: AjouterExpertComponent ,canActivate: [AuthGuard]},
  { path: 'listeExpert', component: ListeExpertComponent ,canActivate: [AuthGuard]},
  { path: 'ajouterFournisseur', component: AjouterFournisseurComponent ,canActivate: [AuthGuard]},
  { path: 'listeFournisseur', component: ListeFournisseurComponent ,canActivate: [AuthGuard]},
  { path: 'modifierAdmin/:id', component: ModifierAdminComponent,canActivate: [AuthGuard]},
  { path: 'modifierClient/:id', component: ModifierClientComponent,canActivate: [AuthGuard]},
  { path: 'modifierExpert/:id', component: ModifierExpertComponent,canActivate: [AuthGuard]},
  { path: 'modifierFournisseur/:id', component: ModifierFournisseurComponent,canActivate: [AuthGuard]},
  { path: 'home', component: HomeComponent ,canActivate: [AuthGuard]},
  { path: 'profil/:id', component: ProfilComponent ,canActivate: [AuthGuard]},
  { path: 'updateProfil/:id', component: UpdateProfilComponent ,canActivate: [AuthGuard]},


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
