package com.projet.SmartAgriculture.RestController;

import com.projet.SmartAgriculture.Entity.Besoin;
import com.projet.SmartAgriculture.Services.BesoinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RequestMapping(value = "/besoin")
@RestController
@CrossOrigin("*")
public class BesoinRestController {

    @Autowired
    BesoinService besoinService;

    // URL of the Python AI module — set in application.properties
    @Value("${ia.module.url:http://localhost:8000}")
    private String iaModuleUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/client/{clientId}")
    public ResponseEntity<?> createBesoin(
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

        // ── Save image to disk ──────────────────────────
        byte[] imageBytes;
        try {
            imageBytes = file.getBytes();  // read ONCE, reuse for both disk and AI
            String fileName = file.getOriginalFilename();
            Path path = Paths.get("D:/pfe/Frontend/src/assets/img/uploads/" + fileName);
            Files.createDirectories(path.getParent());
            Files.write(path, imageBytes);
            besoin.setImage("assets/img/uploads/" + fileName);
        } catch (IOException e) {
            throw new RuntimeException("Error upload image");
        }

        // ── Save the besoin ─────────────────────────────
        Besoin savedBesoin = besoinService.ajouterBesoin(clientId, besoin);

        // ── Call Python AI module ───────────────────────
        Map<String, Object> diagnostic = null;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("titre", titre);
            body.add("description", description);
            body.add("lieu", lieu != null ? lieu : "");

            // Use the already-read bytes — NOT file.getInputStream() which is consumed
            String finalFileName = file.getOriginalFilename();
            ByteArrayResource imageResource = new ByteArrayResource(imageBytes) {
                @Override
                public String getFilename() {
                    return finalFileName;
                }
            };
            body.add("image", imageResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    iaModuleUrl + "/analyse",
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            System.out.println("AI module response status: " + response.getStatusCode());
            System.out.println("AI module response body: " + response.getBody());

            if (response.getStatusCode() == HttpStatus.OK) {
                diagnostic = response.getBody();

                // Save AI diagnostic into the besoin
                if (diagnostic != null) {
                    savedBesoin.setMaladie((String) diagnostic.get("maladie"));
                    savedBesoin.setNiveauRisque((String) diagnostic.get("niveau_risque"));
                    savedBesoin.setRecommandations((String) diagnostic.get("recommandations"));
                    savedBesoin.setAnalyseImage((String) diagnostic.get("analyse_image"));
                    besoinService.saveBesoin(savedBesoin);
                }
            }
        } catch (Exception e) {
            // AI module failure should NOT block the besoin creation
            System.err.println("AI module error: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of(
                "besoin", savedBesoin,
                "diagnostic", diagnostic != null ? diagnostic : Map.of(
                        "maladie", "Analyse en cours...",
                        "niveau_risque", "inconnu",
                        "recommandations", "Le module IA n'est pas disponible pour le moment."
                )
        ));
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

    @GetMapping("/client/{clientId}/valide")
    public ResponseEntity<List<Besoin>> getBesoinsValidesByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(
                besoinService.getBesoinsByClientAndStatut(clientId, "VALIDE_PAR_EXPERT")
        );
    }

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