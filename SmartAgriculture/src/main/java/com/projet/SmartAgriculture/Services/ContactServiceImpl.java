package com.projet.SmartAgriculture.Services;

import com.projet.SmartAgriculture.Entity.Contact;
import com.projet.SmartAgriculture.Repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ContactServiceImpl implements ContactService {

    @Autowired
    ContactRepository contactRepository;

    @Override
    public Contact AjouterContact(Contact contact) {
        return contactRepository.save(contact);
    }
    @Override
    public void SupprimerContact(Long id) {
        contactRepository.deleteById(id);
    }
    @Override
    public List<Contact> AfficherContact() {
        return contactRepository.findAll();
    }
    @Override
    public Optional<Contact> AfficherContactById(Long id) {
        return contactRepository.findById(id);
    }
}