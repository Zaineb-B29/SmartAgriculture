package com.projet.SmartAgriculture.RestController;

import com.projet.SmartAgriculture.Entity.Besoin;
import com.projet.SmartAgriculture.Services.BesoinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RequestMapping(value = "/besoin")
@RestController
@CrossOrigin("*")
public class BesoinRestController {
    @Autowired
    BesoinService besoinService;
    @PostMapping("/client/{clientId}")
    public ResponseEntity<Besoin> createBesoin(@PathVariable Long clientId, @RequestBody Besoin besoin) {
        Besoin created = besoinService.ajouterBesoin(clientId,besoin);
        return ResponseEntity.ok(created);
    }

    @RequestMapping(method = RequestMethod.GET)
    public List<Besoin> AfficherBesoin(){
        return besoinService.AfficherBesoin();
    }



    @RequestMapping(value = "/{id}" , method = RequestMethod.GET)
    public Optional<Besoin> getBesoinById(@PathVariable("id") Long id){

        Optional<Besoin> besoin = besoinService.AfficherBesoinById(id);
        return besoin;
    }
}
