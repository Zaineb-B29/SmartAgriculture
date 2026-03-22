package com.projet.SmartAgriculture.Services;

import com.projet.SmartAgriculture.Entity.Fournisseur;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

public interface FournisseurService {
    ResponseEntity<Object> AjouterFournisseur(Fournisseur fournisseur);
    Fournisseur ModifierFournisseur(Fournisseur fournisseur);
    List<Fournisseur> AfficherFournisseur();
    void SupprimerFournisseur(Long id);
    Optional<Fournisseur> AfficherFournisseurById(Long id);

    ResponseEntity<?> confirmationmail(String confirmationemail);
}
