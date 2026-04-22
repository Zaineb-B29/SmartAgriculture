package com.projet.SmartAgriculture.RestController;

import com.projet.SmartAgriculture.Entity.PrixProposer;
import com.projet.SmartAgriculture.Repository.PrixProposerRepository;
import com.projet.SmartAgriculture.Services.PrixProposerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/prixproposer")
@CrossOrigin("*")
public class PrixProposerRestController {
    @Autowired
    private PrixProposerRepository prixProposerRepository;
    @Autowired
    private PrixProposerService prixProposerService;

    @PostMapping("/fournisseur/{fournisseurId}/besoin/{besoinId}")
    public ResponseEntity<PrixProposer> ajouterPrix(
            @PathVariable Long fournisseurId,
            @PathVariable Long besoinId,
            @RequestBody String prix          // String, pas PrixProposer
    ) {
        PrixProposer created = prixProposerService.ajouterPrixProposer(fournisseurId, besoinId, prix);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/all")
    public ResponseEntity<List<PrixProposer>> afficherPrix() {
        return ResponseEntity.ok(prixProposerService.afficherPrixProposer());
    }

    @GetMapping("/besoin/{besoinId}")
    public ResponseEntity<List<PrixProposer>> getByBesoin(@PathVariable Long besoinId) {
        return ResponseEntity.ok(prixProposerService.getByBesoin(besoinId));
    }

    @GetMapping("/fournisseur/{fournisseurId}")
    public ResponseEntity<List<PrixProposer>> getByFournisseur(@PathVariable Long fournisseurId) {
        return ResponseEntity.ok(prixProposerService.getByFournisseur(fournisseurId));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<PrixProposer>> getUnreadContacts() {
        return ResponseEntity.ok(prixProposerRepository.findByIsReadFalse());
    }

    @PatchMapping("/{id}/mark-as-read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        prixProposerRepository.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead() {
        System.out.println("Mise à jour demandée");
        prixProposerRepository.markAllAsRead();
        return ResponseEntity.ok().build();
    }
}