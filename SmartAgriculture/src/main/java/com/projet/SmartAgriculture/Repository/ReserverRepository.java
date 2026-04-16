package com.projet.SmartAgriculture.Repository;

import com.projet.SmartAgriculture.Entity.Besoin;
import com.projet.SmartAgriculture.Entity.Reserver;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReserverRepository extends JpaRepository<Reserver,Long> {
    List<Reserver> findByClientId(Long clientId);
    List<Reserver> findByPrixProposerId(Long prixProposerId);
}
