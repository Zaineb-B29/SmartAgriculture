package com.projet.SmartAgriculture.RestController;

import com.projet.SmartAgriculture.Entity.Besoin;
import com.projet.SmartAgriculture.Services.BesoinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@RequestMapping(value = "/besoin")
@RestController
@CrossOrigin("*")
public class BesoinRestController {

    @Autowired
    BesoinService besoinService;

    @PostMapping("/client/{clientId}")
    public ResponseEntity<Besoin> createBesoin(
            @PathVariable Long clientId,
            @RequestParam("titre") String titre,
            @RequestParam("description") String description,
            @RequestParam("image") MultipartFile file,
            @RequestParam("nombreArbres") String nombreArbres,
            @RequestParam("lieu") String lieu,
            @RequestParam("metrage") String metrage
    ) {
        Besoin besoin = new Besoin();
        besoin.setTitre(titre);
        besoin.setDescription(description);
        besoin.setNombreArbres(nombreArbres);
        besoin.setLieu(lieu);
        besoin.setMetrage(metrage);

        try {
            String fileName = file.getOriginalFilename();
            Path path = Paths.get("D:/pfe/Frontend/src/assets/img/uploads/" + fileName);
            Files.createDirectories(path.getParent());
            Files.write(path, file.getBytes());
            besoin.setImage("assets/img/uploads/" + fileName);
        } catch (IOException e) {
            throw new RuntimeException("Error upload image");
        }

        return ResponseEntity.ok(besoinService.ajouterBesoin(clientId, besoin));
    }

    @GetMapping
    public List<Besoin> AfficherBesoin() {
        return besoinService.AfficherBesoin();
    }

    @GetMapping("/{id}")
    public Optional<Besoin> getBesoinById(@PathVariable Long id) {
        return besoinService.AfficherBesoinById(id);
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<Besoin>> getMesBesoins(@PathVariable Long clientId) {
        return ResponseEntity.ok(besoinService.getBesoinsByClient(clientId));
    }

    @PutMapping("/verify/{besoinId}/expert/{expertId}")
    public ResponseEntity<Besoin> verifyBesoin(
            @PathVariable Long besoinId,
            @PathVariable Long expertId,
            @RequestBody Besoin besoinRequest
    ) {
        return ResponseEntity.ok(besoinService.verifyBesoin(
                besoinId,
                expertId,
                besoinRequest.getDescriptionExpert()
        ));
    }

    @GetMapping("/valide")
    public List<Besoin> getBesoinsValides() {
        return besoinService.AfficherBesoinValide();
    }

    @PutMapping("/expert/update/{besoinsId}/expert/{expertId}")
    public ResponseEntity<Besoin> updateBesoinByExpert(
            @PathVariable Long besoinsId,
            @PathVariable Long expertId,
            @RequestParam String descriptionExpert,
            @RequestParam Double quantite
    ) {
        return ResponseEntity.ok(
                besoinService.updateBesoinByExpert(besoinsId, expertId, descriptionExpert, quantite)
        );
    }

    @GetMapping("/en-attente")
    public ResponseEntity<List<Besoin>> getBesoinsEnAttente() {
        return ResponseEntity.ok(besoinService.getBesoinsEnAttente());
    }

    @GetMapping("/expert/{expertId}")
    public ResponseEntity<List<Besoin>> getBesoinsByExpert(@PathVariable Long expertId) {
        return ResponseEntity.ok(besoinService.getBesoinsByExpert(expertId));
    }

    // ── Besoins validés d'un client spécifique ──
    @GetMapping("/client/{clientId}/valide")
    public ResponseEntity<List<Besoin>> getBesoinsValidesByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(
                besoinService.getBesoinsByClientAndStatut(clientId, "VALIDE_PAR_EXPERT")
        );
    }

    // ── Besoins en attente d'un client spécifique ──
    @GetMapping("/client/{clientId}/en-attente")
    public ResponseEntity<List<Besoin>> getBesoinsEnAttenteByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(
                besoinService.getBesoinsByClientAndStatut(clientId, "EN_ATTENTE_VALIDATION")
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBesoin(@PathVariable Long id) {
        besoinService.deleteBesoin(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/client/update/{id}")
    public ResponseEntity<Besoin> updateBesoin(
            @PathVariable Long id,
            @RequestParam("titre") String titre,
            @RequestParam("description") String description,
            @RequestParam("nombreArbres") String nombreArbres,
            @RequestParam("lieu") String lieu,
            @RequestParam("metrage") String metrage,
            @RequestParam(value = "image", required = false) MultipartFile file
    ) {
        Besoin updated = new Besoin();
        updated.setTitre(titre);
        updated.setDescription(description);
        updated.setNombreArbres(nombreArbres);
        updated.setLieu(lieu);
        updated.setMetrage(metrage);

        if (file != null && !file.isEmpty()) {
            try {
                String fileName = file.getOriginalFilename();
                Path path = Paths.get("D:/pfe/Frontend/src/assets/img/uploads/" + fileName);
                Files.createDirectories(path.getParent());
                Files.write(path, file.getBytes());
                updated.setImage("assets/img/uploads/" + fileName);
            } catch (IOException e) {
                throw new RuntimeException("Error upload image");
            }
        }

        return ResponseEntity.ok(besoinService.updateBesoin(id, updated));
    }
}