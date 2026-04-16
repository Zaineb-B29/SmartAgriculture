package com.projet.SmartAgriculture.Services;

import com.projet.SmartAgriculture.Entity.Reserver;

import java.util.List;

public interface ReserverService {
    Reserver ajouterReserver(Long clientId, Long prixProposerId);
    List<Reserver> afficherReserver();
    List<Reserver> getByClient(Long clientId);
    List<Reserver> getByPrixProposer(Long prixProposerId);
    List<Reserver> getMesReservations(Long clientId);
}
