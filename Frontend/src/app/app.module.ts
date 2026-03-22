import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RegistreClientComponent } from './registre-client/registre-client.component';
import { RegistreExpertComponent } from './registre-expert/registre-expert.component';
import { RegistreFournisseurComponent } from './registre-fournisseur/registre-fournisseur.component';
import { LoginClientComponent } from './login-client/login-client.component';
import { LoginExpertComponent } from './login-expert/login-expert.component';
import { LoginFournisseurComponent } from './login-fournisseur/login-fournisseur.component';
import { AjouterBesoinComponent } from './ajouter-besoin/ajouter-besoin.component';
import { ListeBesoinComponent } from './liste-besoin/liste-besoin.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    ContactComponent,
    HeaderComponent,
    FooterComponent,
    RegistreClientComponent,
    RegistreExpertComponent,
    RegistreFournisseurComponent,
    LoginClientComponent,
    LoginExpertComponent,
    LoginFournisseurComponent,
    AjouterBesoinComponent,
    ListeBesoinComponent,

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
