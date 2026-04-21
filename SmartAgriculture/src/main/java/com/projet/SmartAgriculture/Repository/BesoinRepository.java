package com.projet.SmartAgriculture.Repository;

import com.projet.SmartAgriculture.Entity.Besoin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BesoinRepository extends JpaRepository<Besoin, Long> {
    List<Besoin> findByClientId(Long clientId);
    List<Besoin> findByEtatTrue();
    List<Besoin> findByExpertId(Long expertId);
    List<Besoin> findByStatut(String statut);    List<Besoin> findByEtatFalse();
    List<Besoin> findByClientIdAndEtatTrue(Long clientId);
    @Query("SELECT b FROM Besoin b WHERE b.client.id = :clientId AND b.statut = :statut")
    List<Besoin> findByClientIdAndStatut(@Param("clientId") Long clientId, @Param("statut") String statut);
}