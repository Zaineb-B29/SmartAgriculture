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

        // 📷 save image
        try {
            String fileName = file.getOriginalFilename();
            Path path = Paths.get("D:/pfe/Frontend/src/assets/img/uploads/" + fileName);

            Files.createDirectories(path.getParent());
            Files.write(path, file.getBytes());

            // store relative Angular assets path
            besoin.setImage("assets/img/uploads/" + fileName);

        } catch (IOException e) {
            throw new RuntimeException("Error upload image");
        }

        Besoin created = besoinService.ajouterBesoin(clientId, besoin);

        return ResponseEntity.ok(created);
    }

    @RequestMapping(method = RequestMethod.GET)
    public List<Besoin> AfficherBesoin() {
        return besoinService.AfficherBesoin();
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public Optional<Besoin> getBesoinById(@PathVariable("id") Long id) {
        Optional<Besoin> besoin = besoinService.AfficherBesoinById(id);
        return besoin;
    }
}