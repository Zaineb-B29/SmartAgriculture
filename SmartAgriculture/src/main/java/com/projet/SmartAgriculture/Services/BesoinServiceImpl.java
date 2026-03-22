package com.projet.SmartAgriculture.Services;

import com.projet.SmartAgriculture.Entity.Besoin;
import com.projet.SmartAgriculture.Entity.Client;
import com.projet.SmartAgriculture.Repository.BesoinRepository;
import com.projet.SmartAgriculture.Repository.ClientRepository;
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

    @Override
    public Besoin ajouterBesoin(Long clientId, Besoin besoin) {

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        besoin.setClient(client);
        besoin.setDescription(besoin.getDescription());
        besoin.setType(besoin.getType());
        besoin.setImage(besoin.getImage());
        besoin.setNombreArbres(besoin.getNombreArbres());
        besoin.setLieu(besoin.getLieu());
        besoin.setMetrage(besoin.getMetrage());
        return besoinRepository.save(besoin);
    }

    @Override
    public List<Besoin> AfficherBesoin() {
        return besoinRepository.findAll();
    }

    @Override
    public Optional<Besoin> AfficherBesoinById(Long id) {
        return besoinRepository.findById(id);
    }
}
