import { Component } from '@angular/core';
import { CrudService } from '../service/crud.service';
import { Contact } from '../Entites/Contact.Entites';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
contacts: Contact[] = [];

  constructor(private crudService: CrudService) {}

  ngOnInit(): void {
    this.getMessages();
  }

  getMessages() {
    this.crudService.getContacts().subscribe(data => {
      this.contacts = data;
    });
  }
}
