package com.projet.SmartAgriculture.Repository;

import com.projet.SmartAgriculture.Entity.Reserver;
import com.projet.SmartAgriculture.Entity.Suivi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SuiviRepository extends JpaRepository<Suivi, Long> {
    @Query("SELECT s FROM Suivi s JOIN s.reserver r WHERE r.client.id = :clientId")
    List<Suivi> findSuivisByClientId(@Param("clientId") Long clientId);

    @Query("""
            SELECT r FROM Reserver r
            LEFT JOIN Suivi s ON s.reserver.id = r.id
            WHERE s.id IS NULL
            """)
    List<Reserver> findReservationsWithoutSuivi();

    boolean existsByReserverId(Long reserverId);

    @Query("SELECT s FROM Suivi s WHERE s.reserver.prixProposer.fournisseur.id = :fournisseurId")
    List<Suivi> findByFournisseurId(@Param("fournisseurId") Long fournisseurId);
}