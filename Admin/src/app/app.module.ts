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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
