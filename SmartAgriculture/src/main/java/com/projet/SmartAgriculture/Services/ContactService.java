package com.projet.SmartAgriculture.Services;

import com.projet.SmartAgriculture.Entity.Admin;
import com.projet.SmartAgriculture.Entity.Contact;

import java.util.List;
import java.util.Optional;

public interface ContactService {
    Contact AjouterContact(Contact contact);
    void SupprimerContact(Long id);
    List<Contact> AfficherContact();
    Optional<Contact> AfficherContactById(Long id);
}
