import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { RegistreClientComponent } from './registre-client/registre-client.component';
import { RegistreFournisseurComponent } from './registre-fournisseur/registre-fournisseur.component';
import { RegistreExpertComponent } from './registre-expert/registre-expert.component';
import { LoginClientComponent } from './login-client/login-client.component';
import { LoginExpertComponent } from './login-expert/login-expert.component';
import { LoginFournisseurComponent } from './login-fournisseur/login-fournisseur.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'about', component: AboutComponent},
  {path: 'contact', component: ContactComponent},
  {path:'registreClient', component: RegistreClientComponent},
  {path:'registreFournisseur', component: RegistreFournisseurComponent},
  {path:'registreExpert', component: RegistreExpertComponent},
  {path:'loginClient', component: LoginClientComponent},
  {path:'loginFournisseur', component: LoginFournisseurComponent},
  {path:'loginExpert', component: LoginExpertComponent},
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
