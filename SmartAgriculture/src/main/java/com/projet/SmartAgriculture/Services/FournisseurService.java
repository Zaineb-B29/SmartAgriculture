package com.projet.SmartAgriculture.Services;

import com.projet.SmartAgriculture.Entity.Fournisseur;
import java.util.List;
import java.util.Optional;

public interface FournisseurService {
    Fournisseur AjouterFournisseur(Fournisseur fournisseur);
    Fournisseur ModifierFournisseur(Fournisseur fournisseur);
    List<Fournisseur> AfficherFournisseur();
    void SupprimerFournisseur(Long id);
    Optional<Fournisseur> AfficherFournisseurById(Long id);

}
