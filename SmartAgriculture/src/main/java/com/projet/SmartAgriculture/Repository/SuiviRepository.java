package com.projet.SmartAgriculture.Repository;

import com.projet.SmartAgriculture.Entity.Suivi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SuiviRepository extends JpaRepository<Suivi, Long> {
    @Query("SELECT s FROM Suivi s JOIN s.reserver r WHERE r.client.id = :clientId")
    List<Suivi> findSuivisByClientId(@Param("clientId") Long clientId);
}
