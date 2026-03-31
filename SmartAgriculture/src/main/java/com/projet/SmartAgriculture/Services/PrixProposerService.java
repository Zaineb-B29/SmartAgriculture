package com.projet.SmartAgriculture.Services;

import com.projet.SmartAgriculture.Entity.PrixProposer;
import java.util.List;

public interface PrixProposerService {
    PrixProposer ajouterPrixProposer(Long fournisseurId, Long besoinId, String prix);
    List<PrixProposer> afficherPrixProposer();
}
