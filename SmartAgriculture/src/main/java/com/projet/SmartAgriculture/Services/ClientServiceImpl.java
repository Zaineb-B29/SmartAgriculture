package com.projet.SmartAgriculture.Services;

import com.projet.SmartAgriculture.Entity.Client;
import com.projet.SmartAgriculture.Repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClientServiceImpl implements ClientService {
    @Autowired // to call this page from another page
    ClientRepository clientRepository;

    @Override
    public Client AjouterClient(Client client) {
        return clientRepository.save(client);
    }

    @Override
    public Client ModifierClient(Client client) {
        return clientRepository.save(client);
    }

    @Override
    public List<Client> AfficherClient() {
        return clientRepository.findAll();
    }

    @Override
    public void SupprimerClient(Long id) {
        clientRepository.deleteById(id);
    }

    @Override
    public Optional<Client> AfficherClientById(Long id) {
        return clientRepository.findById(id);
    }
}