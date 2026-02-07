package com.projet.SmartAgriculture.Services;

import com.projet.SmartAgriculture.Entity.Fournisseur;
import com.projet.SmartAgriculture.Repository.FournisseurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FournisseurServiceImpl implements FournisseurService {

    @Autowired
    private FournisseurRepository fournisseurRepository;

    @Override
    public Fournisseur AjouterFournisseur(Fournisseur fournisseur) {
        return fournisseurRepository.save(fournisseur);
    }

    @Override
    public Fournisseur ModifierFournisseur(Fournisseur fournisseur) {
        return fournisseurRepository.save(fournisseur);
    }

    @Override
    public List<Fournisseur> AfficherFournisseur() {
        return fournisseurRepository.findAll();
    }

    @Override
    public void SupprimerFournisseur(Long id) {
        fournisseurRepository.deleteById(id);
    }

    @Override
    public Optional<Fournisseur> AfficherFournisseurById(Long id) {
        return fournisseurRepository.findById(id);
    }
}

