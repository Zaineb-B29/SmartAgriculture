package com.projet.SmartAgriculture.Repository;

import com.projet.SmartAgriculture.Entity.Fournisseur;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FournisseurRepository extends JpaRepository<Fournisseur,Long> {
    Fournisseur findFournisseurByEmail(String email);

    boolean existsByEmail(String email);
}
