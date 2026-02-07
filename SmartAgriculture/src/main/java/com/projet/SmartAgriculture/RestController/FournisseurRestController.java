package com.projet.SmartAgriculture.RestController;

import com.projet.SmartAgriculture.Entity.Fournisseur;
import com.projet.SmartAgriculture.Repository.FournisseurRepository;
import com.projet.SmartAgriculture.Services.FournisseurService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RequestMapping(value = "/fournisseur")
@RestController
@CrossOrigin("*")
public class FournisseurRestController {
    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();

    @Autowired
    FournisseurRepository fournisseurRepository;

    @Autowired
    FournisseurService fournisseurService;

    @RequestMapping(method = RequestMethod.POST )
    ResponseEntity<?> AjouterFournisseur (@RequestBody Fournisseur fournisseur){

        HashMap<String, Object> response = new HashMap<>();
        if(fournisseurRepository.existsByEmail(fournisseur.getEmail())){
            response.put("message", "email exist deja !");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }else{
            fournisseur.setMdp(this.bCryptPasswordEncoder.encode(fournisseur.getMdp()));
            Fournisseur savedUser = fournisseurRepository.save(fournisseur);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        }
    }

    @RequestMapping(method = RequestMethod.GET)
    public List<Fournisseur> AfficherFournisseur(){
        return fournisseurService.AfficherFournisseur();
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE )
    public void SupprimerFournisseur(@PathVariable("id") Long id){
        fournisseurService.SupprimerFournisseur(id);
    }

    @RequestMapping(value = "/{id}" , method = RequestMethod.GET)
    public Optional<Fournisseur> getFournisseurById(@PathVariable("id") Long id){
        Optional<Fournisseur> fournisseur = fournisseurService.AfficherFournisseurById(id);
        return fournisseur;
    }

    @RequestMapping(value = "/{id}" ,method = RequestMethod.PUT)
    public Fournisseur ModifierFournisseur(@PathVariable("id")Long id, @RequestBody Fournisseur fournisseur){
        fournisseur.setMdp(this.bCryptPasswordEncoder.encode(fournisseur.getMdp()));
        Fournisseur savedUser = fournisseurRepository.save(fournisseur);

        Fournisseur newFournisseur = fournisseurService.ModifierFournisseur(fournisseur);
        return newFournisseur;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginFournisseur(@RequestBody Fournisseur fournisseur) {
        System.out.println("in login-fournisseur"+fournisseur);
        HashMap<String, Object> response = new HashMap<>();

        Fournisseur userFromDB = fournisseurRepository.findFournisseurByEmail(fournisseur.getEmail());
        System.out.println("userFromDB+fournisseur"+userFromDB);
        if (userFromDB == null) {
            response.put("message", "Fournisseur not found!");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } else {
            boolean compare = this.bCryptPasswordEncoder.matches(fournisseur.getMdp(), userFromDB.getMdp());
            System.out.println("compare"+compare);
            if (!compare) {
                response.put("message", "Password incorrect!");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }else
            {
                String token = Jwts.builder()
                        .claim("data", userFromDB)
                        .signWith(SignatureAlgorithm.HS256, "SECRET")
                        .compact();
                response.put("token", token);
                response.put("role", "FOURNISSEUR");
                System.out.println("works");
                return ResponseEntity.status(HttpStatus.OK).body(response);
            }
        }
    }
}
