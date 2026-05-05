package com.projet.SmartAgriculture.RestController;
import com.projet.SmartAgriculture.Entity.Reserver;
import com.projet.SmartAgriculture.Entity.Suivi;
import com.projet.SmartAgriculture.Services.SuiviService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;
@CrossOrigin(origins = "http://localhost:4200")
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

    @GetMapping("/without-suivi")
    public ResponseEntity<List<Reserver>> getReservationsWithoutSuivi() {
        return ResponseEntity.ok(
                suiviService.getReservationsWithoutSuivi()
        );
    }

    @Configuration
    public class WebConfig implements WebMvcConfigurer {
        @Override
        public void addResourceHandlers(ResourceHandlerRegistry registry) {
            registry.addResourceHandler("/uploads/**")
                    .addResourceLocations("file:D:/pfe/uploads/");
        }
    }

    @GetMapping("/fournisseur/{fournisseurId}")
    @CrossOrigin(origins = "http://localhost:4200")
    public ResponseEntity<List<Suivi>> getSuivisByFournisseur(@PathVariable Long fournisseurId) {
        List<Suivi> suivis = suiviService.getSuivisByFournisseurId(fournisseurId);
        return ResponseEntity.ok(suivis);
    }
}