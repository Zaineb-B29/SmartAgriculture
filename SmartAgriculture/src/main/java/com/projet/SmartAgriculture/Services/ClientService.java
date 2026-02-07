package com.projet.SmartAgriculture.Services;

import com.projet.SmartAgriculture.Entity.Client;

import java.util.List;
import java.util.Optional;

public interface ClientService {
    Client AjouterClient(Client client);
    Client ModifierClient(Client client);
    List<Client> AfficherClient();
    void SupprimerClient(Long id);
    Optional<Client> AfficherClientById(Long id);
}
