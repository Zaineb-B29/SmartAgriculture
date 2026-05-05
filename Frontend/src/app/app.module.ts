import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { RegistreClientComponent } from './registre-client/registre-client.component';
import { RegistreExpertComponent } from './registre-expert/registre-expert.component';
import { RegistreFournisseurComponent } from './registre-fournisseur/registre-fournisseur.component';
import { LoginClientComponent } from './login-client/login-client.component';
import { LoginExpertComponent } from './login-expert/login-expert.component';
import { LoginFournisseurComponent } from './login-fournisseur/login-fournisseur.component';
import { AjouterBesoinComponent } from './ajouter-besoin/ajouter-besoin.component';
import { ListeBesoinComponent } from './liste-besoin/liste-besoin.component';
import { MesPropositionsComponent } from './mes-propositions/mes-propositions.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ListeBesoinEnAttenteComponent } from './liste-besoin-en-attente/liste-besoin-en-attente.component';
import { AjouterSuiviFournisComponent } from './ajouter-suivi-fournis/ajouter-suivi-fournis.component';
import { ModifierBesoinComponent } from './modifier-besoin/modifier-besoin.component';
import { SuiviEvolutionComponent } from './suivi-evolution/suivi-evolution.component';
import { MessageComponent } from './message/message.component';
import { ProfileComponent } from './profile/profile.component';
import { SuiviClientComponent } from './suivi-client/suivi-client.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    HeaderComponent,
    FooterComponent,
    RegistreClientComponent,
    RegistreExpertComponent,
    RegistreFournisseurComponent,
    LoginClientComponent,
    LoginExpertComponent,
    LoginFournisseurComponent,
    UserProfileComponent,
    AjouterBesoinComponent,
    ListeBesoinComponent,
    MesPropositionsComponent,
    ListeBesoinEnAttenteComponent,
    AjouterSuiviFournisComponent,
    ModifierBesoinComponent,
    SuiviEvolutionComponent,
    MessageComponent,
    ProfileComponent,
    SuiviClientComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
