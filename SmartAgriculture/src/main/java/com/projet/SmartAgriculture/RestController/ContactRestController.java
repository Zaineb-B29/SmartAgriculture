package com.projet.SmartAgriculture.RestController;

import com.projet.SmartAgriculture.Entity.Contact;
import com.projet.SmartAgriculture.Repository.ContactRepository;
import com.projet.SmartAgriculture.Services.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@RequestMapping(value = "/contact")
@RestController
@CrossOrigin("*")
public class ContactRestController {

    @Autowired
    ContactRepository contactRepository;

    @Autowired
    ContactService contactService;

    @RequestMapping(method = RequestMethod.POST)
    ResponseEntity<?> AjouterContact(@RequestBody Contact contact){

        HashMap<String, Object> response = new HashMap<>();

        Contact savedContact = contactRepository.save(contact);
        response.put("message", "Contact ajouté avec succès");
        response.put("data", savedContact);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @RequestMapping(method = RequestMethod.GET)
    public List<Contact> AfficherContact(){
        return contactService.AfficherContact();
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public void SupprimerContact(@PathVariable("id") Long id){
        contactService.SupprimerContact(id);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public Optional<Contact> getContactById(@PathVariable("id") Long id){
        Optional<Contact> contact = contactService.AfficherContactById(id);
        return contact;
    }


}