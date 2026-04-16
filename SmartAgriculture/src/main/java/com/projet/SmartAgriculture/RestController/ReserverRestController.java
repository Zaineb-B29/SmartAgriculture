package com.projet.SmartAgriculture.RestController;

import com.projet.SmartAgriculture.Entity.Reserver;
import com.projet.SmartAgriculture.Services.ReserverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reserver")
@CrossOrigin("*")
public class ReserverRestController {

    @Autowired
    private ReserverService reserverService;

    @PostMapping("/client/{clientId}/prixproposer/{prixProposerId}")
    public ResponseEntity<?> ajouterReserver(
            @PathVariable Long clientId,
            @PathVariable Long prixProposerId
    ) {
        try {
            Reserver created = reserverService.ajouterReserver(clientId, prixProposerId);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<Reserver>> afficherReserver() {
        return ResponseEntity.ok(reserverService.afficherReserver());
    }

    // ✅ ONE method handles both getByClient and getMesReservations
    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<Reserver>> getByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(reserverService.getByClient(clientId));
    }

    @GetMapping("/prixproposer/{prixProposerId}")
    public ResponseEntity<List<Reserver>> getByPrixProposer(@PathVariable Long prixProposerId) {
        return ResponseEntity.ok(reserverService.getByPrixProposer(prixProposerId));
    }
}