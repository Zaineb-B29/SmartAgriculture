package com.projet.SmartAgriculture.Services;

import com.projet.SmartAgriculture.Entity.Client;
import com.projet.SmartAgriculture.Entity.PrixProposer;
import com.projet.SmartAgriculture.Entity.Reserver;
import com.projet.SmartAgriculture.Repository.ClientRepository;
import com.projet.SmartAgriculture.Repository.PrixProposerRepository;
import com.projet.SmartAgriculture.Repository.ReserverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReserverServiceImpl implements ReserverService {

    @Autowired
    private ReserverRepository reserverRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private PrixProposerRepository prixProposerRepository;

    @Override
    public Reserver ajouterReserver(Long clientId, Long prixProposerId) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + clientId));

        PrixProposer prixProposer = prixProposerRepository.findById(prixProposerId)
                .orElseThrow(() -> new RuntimeException("PrixProposer not found with id: " + prixProposerId));

        Reserver reserver = new Reserver();
        reserver.setClient(client);
        reserver.setPrixProposer(prixProposer);

        return reserverRepository.save(reserver);
    }

    @Override
    public List<Reserver> afficherReserver() {
        return reserverRepository.findAll();
    }

    @Override
    public List<Reserver> getByClient(Long clientId) {
        return reserverRepository.findByClientId(clientId);
    }

    @Override
    public List<Reserver> getByPrixProposer(Long prixProposerId) {
        return reserverRepository.findByPrixProposerId(prixProposerId);
    }

    @Override
    public List<Reserver> getMesReservations(Long clientId) {
        return reserverRepository.findByClientId(clientId);
    }

    @Override
    public List<Reserver> getByFournisseur(Long fournisseurId) {
        return reserverRepository.findByPrixProposerFournisseurId(fournisseurId);
    }

    @Override
    public List<Reserver> getReservationsWithoutSuivi() {
        return reserverRepository.findReservationsWithoutSuivi();
    }
}