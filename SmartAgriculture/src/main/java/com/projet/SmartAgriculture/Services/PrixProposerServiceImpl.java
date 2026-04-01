package com.projet.SmartAgriculture.Services;

import com.projet.SmartAgriculture.Entity.Besoin;
import com.projet.SmartAgriculture.Entity.Fournisseur;
import com.projet.SmartAgriculture.Entity.PrixProposer;
import com.projet.SmartAgriculture.Repository.BesoinRepository;
import com.projet.SmartAgriculture.Repository.FournisseurRepository;
import com.projet.SmartAgriculture.Repository.PrixProposerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrixProposerServiceImpl implements PrixProposerService {

    @Autowired
    private FournisseurRepository fournisseurRepository;

    @Autowired
    private BesoinRepository besoinRepository;

    @Autowired
    private PrixProposerRepository prixProposerRepository;

    @Override
    public PrixProposer ajouterPrixProposer(Long fournisseurId, Long besoinId, String prix) {
        Fournisseur fournisseur = fournisseurRepository.findById(fournisseurId)
                .orElseThrow(() -> new RuntimeException("Fournisseur not found"));

        Besoin besoin = besoinRepository.findById(besoinId)
                .orElseThrow(() -> new RuntimeException("Besoin not found"));

        PrixProposer nouvellePrix = new PrixProposer();
        nouvellePrix.setFournisseur(fournisseur);
        nouvellePrix.setBesoin(besoin);
        nouvellePrix.setPrix(prix);

        return prixProposerRepository.save(nouvellePrix);
    }

    @Override
    public List<PrixProposer> afficherPrixProposer() {
        return prixProposerRepository.findAll();
    }
    @Override
    public List<PrixProposer> getByBesoin(Long besoinId) {
        return prixProposerRepository.findByBesoinId(besoinId);
    }

    @Override
    public List<PrixProposer> getByFournisseur(Long fournisseurId) {
        return prixProposerRepository.findByFournisseurId(fournisseurId);
    }
}