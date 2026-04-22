package com.projet.SmartAgriculture.Repository;

import com.projet.SmartAgriculture.Entity.PrixProposer;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PrixProposerRepository extends JpaRepository<PrixProposer,Long> {
    List<PrixProposer> findByBesoinId(Long besoinId);
    List<PrixProposer> findByFournisseurId(Long fournisseurId);

    List<PrixProposer> findByIsReadFalse();

    @Modifying
    @Transactional
    @Query("UPDATE PrixProposer p SET p.isRead = true WHERE p.id = :id")
    void markAsRead(@Param("id") Long id);

    @Modifying
    @Transactional
    @Query("UPDATE PrixProposer p SET p.isRead = true")
    void markAllAsRead();

}
