package com.projet.SmartAgriculture.Services;

import com.projet.SmartAgriculture.Entity.Besoin;
import java.util.List;
import java.util.Optional;

public interface BesoinService {
    Besoin ajouterBesoin(Long clientId, Besoin besoin);
    List<Besoin> AfficherBesoin();
    List<Besoin> AfficherBesoinValide();
    Optional<Besoin> AfficherBesoinById(Long id);
    List<Besoin> getBesoinsByClient(Long clientId);
    Besoin verifyBesoin(Long besoinId, Long expertId, String descriptionExpert);
    Besoin updateBesoinByExpert(Long besoinId, Long expertId, String descriptionExpert, Double quantite);
    List<Besoin> getBesoinsEnAttente();
    List<Besoin> getBesoinsByExpert(Long expertId);
}