package com.projet.SmartAgriculture.Services;

import com.projet.SmartAgriculture.Entity.Besoin;
import com.projet.SmartAgriculture.Entity.Client;
import com.projet.SmartAgriculture.Entity.ExpertAgricole;
import com.projet.SmartAgriculture.Repository.BesoinRepository;
import com.projet.SmartAgriculture.Repository.ClientRepository;
import com.projet.SmartAgriculture.Repository.ExpertAgricoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BesoinServiceImpl implements BesoinService {

    @Autowired
    BesoinRepository besoinRepository;
    @Autowired
    ClientRepository clientRepository;
    @Autowired
    ExpertAgricoleRepository expertAgricoleRepository;

    @Override
    public Besoin ajouterBesoin(Long clientId, Besoin besoin) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));
        besoin.setClient(client);
        besoin.setEtat(false);
        besoin.setStatut("EN_ATTENTE_VALIDATION");
        return besoinRepository.save(besoin);
    }

    @Override
    public List<Besoin> AfficherBesoin() {
        return besoinRepository.findAll();
    }

    @Override
    public List<Besoin> AfficherBesoinValide() {
        return besoinRepository.findByStatut("VALIDE_PAR_EXPERT");
    }
    @Override
    public Optional<Besoin> AfficherBesoinById(Long id) {
        return besoinRepository.findById(id);
    }

    @Override
    public List<Besoin> getBesoinsByClient(Long clientId) {
        return besoinRepository.findByClientId(clientId)
                .stream()
                .filter(b -> "VALIDE_PAR_EXPERT".equals(b.getStatut()))
                .toList();    }

    @Override
    public Besoin verifyBesoin(Long besoinId, Long expertId, String descriptionExpert) {
        Besoin besoin = besoinRepository.findById(besoinId)
                .orElseThrow(() -> new RuntimeException("Besoin not found"));

        if (besoin.getEtat()) {
            throw new RuntimeException("Besoin already verified");
        }

        ExpertAgricole expert = expertAgricoleRepository.findById(expertId)
                .orElseThrow(() -> new RuntimeException("Expert not found"));

        besoin.setEtat(true);
        besoin.setDescriptionExpert(descriptionExpert);
        besoin.setExpert(expert);
        besoin.setStatut("VALIDE_PAR_EXPERT");
        besoin.setDateValidationExpert(LocalDateTime.now());

        return besoinRepository.save(besoin);
    }

    @Override
    public Besoin updateBesoinByExpert(Long besoinId, Long expertId, String descriptionExpert, Double quantite) {
        Besoin besoin = besoinRepository.findById(besoinId)
                .orElseThrow(() -> new RuntimeException("Besoin not found"));

        ExpertAgricole expert = expertAgricoleRepository.findById(expertId)
                .orElseThrow(() -> new RuntimeException("Expert not found"));

        besoin.setExpert(expert);
        besoin.setDescriptionExpert(descriptionExpert);
        besoin.setStatut("VALIDE_PAR_EXPERT");
        besoin.setEtat(true);
        besoin.setDateValidationExpert(LocalDateTime.now());
        return besoinRepository.save(besoin);
    }

    @Override
    public List<Besoin> getBesoinsEnAttente() {
        return besoinRepository.findByStatut("EN_ATTENTE_VALIDATION");
    }

    @Override
    public List<Besoin> getBesoinsByExpert(Long expertId) {
        return besoinRepository.findByExpertId(expertId);
    }

    @Override
    public List<Besoin> getBesoinsValidesByClient(Long clientId) {
        return besoinRepository.findByClientIdAndEtatTrue(clientId);
    }

    @Override
    public List<Besoin> getBesoinsByClientAndStatut(Long clientId, String statut) {
        return besoinRepository.findByClientIdAndStatut(clientId, statut);
    }

}