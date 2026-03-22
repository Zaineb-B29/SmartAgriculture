package com.projet.SmartAgriculture.Repository;

import com.projet.SmartAgriculture.Entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactRepository extends JpaRepository<Contact, Long> {

}