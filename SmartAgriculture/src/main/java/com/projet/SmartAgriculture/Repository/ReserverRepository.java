package com.projet.SmartAgriculture.Repository;

import com.projet.SmartAgriculture.Entity.Besoin;
import com.projet.SmartAgriculture.Entity.Reserver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReserverRepository extends JpaRepository<Reserver,Long> {
    List<Reserver> findByClientId(Long clientId);
    List<Reserver> findByPrixProposerId(Long prixProposerId);

    @Query("SELECT r FROM Reserver r WHERE r.prixProposer.fournisseur.id = :fournisseurId")
    List<Reserver> findByPrixProposerFournisseurId(@Param("fournisseurId") Long fournisseurId);
    @Query("""
SELECT r FROM Reserver r
WHERE r.id NOT IN (
    SELECT s.reserver.id FROM Suivi s
)
""")
    List<Reserver> findReservationsWithoutSuivi();
}
