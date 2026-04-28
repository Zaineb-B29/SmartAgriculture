import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AjouterAdminComponent } from './ajouter-admin/ajouter-admin.component';
import { ListeAdminComponent } from './liste-admin/liste-admin.component';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './header/header.component';
import { MenuComponent } from './menu/menu.component';
import { FooterComponent } from './footer/footer.component';
import { ListeClientComponent } from './liste-client/liste-client.component';
import { AjouterClientComponent } from './ajouter-client/ajouter-client.component';
import { AjouterExpertComponent } from './ajouter-expert/ajouter-expert.component';
import { AjouterFournisseurComponent } from './ajouter-fournisseur/ajouter-fournisseur.component';
import { ListeExpertComponent } from './liste-expert/liste-expert.component';
import { ListeFournisseurComponent } from './liste-fournisseur/liste-fournisseur.component';
import { ModifierAdminComponent } from './modifier-admin/modifier-admin.component';
import { ModifierClientComponent } from './modifier-client/modifier-client.component';
import { ModifierExpertComponent } from './modifier-expert/modifier-expert.component';
import { ModifierFournisseurComponent } from './modifier-fournisseur/modifier-fournisseur.component';
import { HomeComponent } from './home/home.component';
import { ProfilComponent } from './profil/profil.component';
import { UpdateProfilComponent } from './update-profil/update-profil.component';
import { ContactComponent } from './contact/contact.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { AdminMessagesComponent } from './admin-messages/admin-messages.component';
import { MessageComponent } from './message/message.component';


@NgModule({
  declarations: [
    AppComponent,
    AjouterAdminComponent,
    ListeAdminComponent,
    LoginComponent,
    HeaderComponent,
    MenuComponent,
    FooterComponent,
    ListeClientComponent,
    AjouterClientComponent,
    AjouterExpertComponent,
    AjouterFournisseurComponent,
    ListeExpertComponent,
    ListeFournisseurComponent,
    ModifierAdminComponent,
    ModifierClientComponent,
    ModifierExpertComponent,
    ModifierFournisseurComponent,
    HomeComponent,
    ProfilComponent,
    UpdateProfilComponent,
    ContactComponent,
    AdminMessagesComponent,
    MessageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxPaginationModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
