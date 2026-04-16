package com.projet.SmartAgriculture.Repository;

import com.projet.SmartAgriculture.Entity.Besoin;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BesoinRepository extends JpaRepository<Besoin,Long> {
    List<Besoin> findByClientId(Long clientId);
    List<Besoin> findByEtatTrue();
}
