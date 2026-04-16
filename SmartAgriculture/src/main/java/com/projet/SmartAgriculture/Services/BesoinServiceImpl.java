package com.projet.SmartAgriculture.Services;

import com.projet.SmartAgriculture.Entity.Besoin;
import com.projet.SmartAgriculture.Entity.Client;
import com.projet.SmartAgriculture.Entity.ExpertAgricole;
import com.projet.SmartAgriculture.Repository.BesoinRepository;
import com.projet.SmartAgriculture.Repository.ClientRepository;
import com.projet.SmartAgriculture.Repository.ExpertAgricoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BesoinServiceImpl implements BesoinService{
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
        besoin.setEtat(false); // required initialization

        return besoinRepository.save(besoin);
    }
    @Override
    public List<Besoin> AfficherBesoin() {
        return besoinRepository.findAll();
    }

    @Override
    public List<Besoin> AfficherBesoinValide() {
        return besoinRepository.findByEtatTrue();
    }


    @Override
    public Optional<Besoin> AfficherBesoinById(Long id) {
        return besoinRepository.findById(id);
    }

    @Override
    public List<Besoin> getBesoinsByClient(Long clientId) {
        return besoinRepository.findByClientId(clientId);
    }

    @Override
    public Besoin verifyBesoin(Long besoinId, Long expertId, String descriptionExpert) {

        Besoin besoin = besoinRepository.findById(besoinId)
                .orElseThrow(() -> new RuntimeException("Besoin not found"));

        if (besoin.isEtat()) {
            throw new RuntimeException("Besoin already verified");
        }

        ExpertAgricole expert = expertAgricoleRepository.findById(expertId)
                .orElseThrow(() -> new RuntimeException("Expert not found"));

        besoin.setEtat(true);
        besoin.setDescriptionExpert(descriptionExpert);
        besoin.setExpert(expert);

        return besoinRepository.save(besoin);
    }
}
