package com.projet.SmartAgriculture.Services;

import com.projet.SmartAgriculture.Entity.Besoin;

import java.util.List;
import java.util.Optional;

public interface BesoinService {
    Besoin ajouterBesoin(Long clientId, Besoin besoin);
    List<Besoin> AfficherBesoin();
    Optional<Besoin> AfficherBesoinById(Long id);

}
