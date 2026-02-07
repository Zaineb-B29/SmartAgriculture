package com.projet.SmartAgriculture.Repository;

import com.projet.SmartAgriculture.Entity.ExpertAgricole;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpertAgricoleRepository extends JpaRepository<ExpertAgricole,Long> {
    boolean existsByEmail(String email);
    ExpertAgricole findExpertAgricoleByEmail(String email);
}
