import { Component } from '@angular/core';
import { CrudService } from '../service/crud.service';
import { Contact } from '../Entites/Contact.Entites';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
    contact: Contact = {
    nom: '',
    email: '',
    sujet: '',
    msg: ''
  };

  successMessage: string = '';
  errorMessage: string = '';

  constructor(private crudService: CrudService) {}

  envoyerMessage(): void {
    this.successMessage = '';
    this.errorMessage = '';

    this.crudService.addContact(this.contact).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Message envoyé avec succès';
        this.contact = {
          nom: '',
          email: '',
          sujet: '',
          msg: ''
        };
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Erreur lors de l’envoi du message';
      }
    });
  }
}