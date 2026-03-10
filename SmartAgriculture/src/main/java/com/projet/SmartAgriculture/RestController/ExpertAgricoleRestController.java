package com.projet.SmartAgriculture.RestController;

import com.projet.SmartAgriculture.Entity.ExpertAgricole;
import com.projet.SmartAgriculture.Repository.ExpertAgricoleRepository;
import com.projet.SmartAgriculture.Services.EmailService;
import com.projet.SmartAgriculture.Services.ExpertAgricoleService;
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

@RequestMapping(value = "/expertAgricole")
@RestController
@CrossOrigin("*")
public class ExpertAgricoleRestController {
    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();

    @Autowired
    ExpertAgricoleRepository expertAgricoleRepository;

    @Autowired
    ExpertAgricoleService expertAgricoleService;

    @Autowired
    EmailService emailService;

    @RequestMapping(method = RequestMethod.POST )
    ResponseEntity<?> AjouterExpertAgricole (@RequestBody ExpertAgricole expertAgricole){

        HashMap<String, Object> response = new HashMap<>();
        if(expertAgricoleRepository.existsByEmail(expertAgricole.getEmail())){
            response.put("message", "email exist deja !");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }else{
            expertAgricole.setMdp(this.bCryptPasswordEncoder.encode(expertAgricole.getMdp()));
            ExpertAgricole savedUser = expertAgricoleRepository.save(expertAgricole);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        }
    }

    @RequestMapping(method = RequestMethod.GET)
    public List<ExpertAgricole> AfficherExpertAgricole(){
        return expertAgricoleService.AfficherExpertAgricole();
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE )
    public void SupprimerExpertAgricole(@PathVariable("id") Long id){
        expertAgricoleService.SupprimerExpertAgricole(id);

    }

    @RequestMapping(value = "/{id}" , method = RequestMethod.GET)
    public Optional<ExpertAgricole> getExpertAgricoleById(@PathVariable("id") Long id){

        Optional<ExpertAgricole> expertAgricole = expertAgricoleService.AfficherExpertAgricoleById(id);
        return expertAgricole;
    }

    @RequestMapping(value = "/{id}" ,method = RequestMethod.PUT)
    public ExpertAgricole ModifierExpertAgricole(@PathVariable("id")Long id, @RequestBody ExpertAgricole expertAgricole){
        expertAgricole.setMdp(this.bCryptPasswordEncoder.encode(expertAgricole.getMdp()));
        ExpertAgricole savedUser = expertAgricoleRepository.save(expertAgricole);

        ExpertAgricole newExpertAgricole = expertAgricoleService.ModifierExpertAgricole(expertAgricole);
        return newExpertAgricole;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginExpertAgricole(@RequestBody ExpertAgricole expertAgricole) {
        System.out.println("in login-expertAgricole"+expertAgricole);
        HashMap<String, Object> response = new HashMap<>();

        ExpertAgricole userFromDB = expertAgricoleRepository.findExpertAgricoleByEmail(expertAgricole.getEmail());
        System.out.println("userFromDB+expertAgricole"+userFromDB);
        if (userFromDB == null) {
            response.put("message", "ExpertAgricole not found!");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } else {
            boolean compare = this.bCryptPasswordEncoder.matches(expertAgricole.getMdp(), userFromDB.getMdp());
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
                response.put("role", "EXPERT_AGRICOLE");
                System.out.println("works");
                return ResponseEntity.status(HttpStatus.OK).body(response);
            }

        }
    }

    @PutMapping(value = "/updateEtat/{id}")
    public ExpertAgricole modifieretatExpertAgricole(@RequestBody ExpertAgricole expertAgricole, @PathVariable("id") Long id) {
        ExpertAgricole newExpertAgricole = null;
        if (expertAgricoleRepository.findById(id).isPresent()) { //ken user deja mawjoud
            ExpertAgricole expertAgricole1 = expertAgricoleRepository.findById(id).get();
            var exid = expertAgricole.getId();
            var nom = expertAgricole.getNom();
            var prenom = expertAgricole.getPrenom();
            var tel = expertAgricole.getTlf();
            var email = expertAgricole.getEmail();
            var mdp = expertAgricole1.getMdp();
            expertAgricole1.setId(exid);
            expertAgricole1.setNom(nom);
            expertAgricole1.setPrenom(prenom);
            expertAgricole1.setTlf(tel);
            expertAgricole1.setEmail(email);
            expertAgricole1.setMdp(mdp);

            //mta3 yjih mail fih l etat
            expertAgricole.setMdp(this.bCryptPasswordEncoder.encode(expertAgricole1.getMdp()));
            if (expertAgricole.isEtat() != expertAgricole1.isEtat()) {
                //ternary expression
                String etat = expertAgricole1.isEtat() ? "Bloqué" : "Accepté";
                emailService.SendSimpleMessage(expertAgricole1.getEmail(), "L'etat de votre compte", "votre compte a été " + etat);
            }
            expertAgricole1.setEtat(expertAgricole.isEtat());
            newExpertAgricole = expertAgricoleRepository.save(expertAgricole1);
        }
        return newExpertAgricole;
    }
}
