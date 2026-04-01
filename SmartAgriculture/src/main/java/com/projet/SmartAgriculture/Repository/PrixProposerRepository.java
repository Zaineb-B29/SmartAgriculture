package com.projet.SmartAgriculture.Repository;

import com.projet.SmartAgriculture.Entity.PrixProposer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrixProposerRepository extends JpaRepository<PrixProposer,Long> {
    List<PrixProposer> findByBesoinId(Long besoinId);
    List<PrixProposer> findByFournisseurId(Long fournisseurId);

}
