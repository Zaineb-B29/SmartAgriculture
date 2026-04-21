package com.projet.SmartAgriculture.RestController;
import com.projet.SmartAgriculture.Entity.Suivi;
import com.projet.SmartAgriculture.Services.SuiviService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/suivi")
public class SuiviRestController {

    @Autowired
    private SuiviService suiviService;

    @PostMapping("/{reservationId}/upload")
    public ResponseEntity<?> uploadSuivi(
            @PathVariable Long reservationId,
            @RequestParam("typeSuivi") String typeSuivi,
            @RequestParam(value = "avant", required = false) List<MultipartFile> avantFiles,
            @RequestParam(value = "apres", required = false) List<MultipartFile> apresFiles
    ) {
        return ResponseEntity.ok(
                suiviService.createSuiviAvecUpload(reservationId, typeSuivi, avantFiles, apresFiles)
        );
    }

    @PostMapping("/{reservationId}/temps-reel")
    public ResponseEntity<?> createTempsReel(@PathVariable Long reservationId) {
        return ResponseEntity.ok(
                suiviService.createSuiviTempsReel(reservationId)
        );
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<Suivi>> getSuivisByClientId(@PathVariable Long clientId) {
        return ResponseEntity.ok(
                suiviService.getSuivisByClientId(clientId)
        );
    }

    @GetMapping
    public List<Suivi> affichersuivi() {
        return suiviService.affichiersuivi();
    }
}