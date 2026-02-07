package com.projet.SmartAgriculture.Services;

import com.projet.SmartAgriculture.Entity.ExpertAgricole;

import java.util.List;
import java.util.Optional;

public interface ExpertAgricoleService {
    ExpertAgricole AjouterExpertAgricole(ExpertAgricole expertAgricole);
    ExpertAgricole ModifierExpertAgricole(ExpertAgricole expertAgricole);
    List<ExpertAgricole> AfficherExpertAgricole();
    void SupprimerExpertAgricole(Long id);
    Optional<ExpertAgricole> AfficherExpertAgricoleById(Long id);
}
