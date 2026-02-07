package com.projet.SmartAgriculture.Repository;

import com.projet.SmartAgriculture.Entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client,Long> {
    boolean existsByEmail(String email);
    Client findClientByEmail(String email);
}
