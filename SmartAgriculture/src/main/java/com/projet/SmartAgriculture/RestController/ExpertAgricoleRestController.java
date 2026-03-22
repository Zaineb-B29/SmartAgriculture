package com.projet.SmartAgriculture.RestController;

import com.projet.SmartAgriculture.Entity.ExpertAgricole;
import com.projet.SmartAgriculture.Repository.ExpertAgricoleRepository;
import com.projet.SmartAgriculture.Services.EmailService;
import com.projet.SmartAgriculture.Services.ExpertAgricoleService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RequestMapping("/expertAgricole")
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

    @PostMapping
    public ResponseEntity<?> AjouterExpertAgricole(@RequestBody ExpertAgricole expertAgricole) {

        HashMap<String, Object> response = new HashMap<>();

        if (expertAgricoleRepository.existsByEmail(expertAgricole.getEmail())) {
            response.put("message", "email exist deja !");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        expertAgricole.setMdp(bCryptPasswordEncoder.encode(expertAgricole.getMdp()));
        expertAgricole.setEtat(false);

        ExpertAgricole savedUser = expertAgricoleRepository.save(expertAgricole);

        String subject = "Création de votre compte Expert Agricole";
        String text =
                "Votre compte SmartAgricole a été créé avec succès.\n\n" +
                        "Nom: " + savedUser.getNom() + "\n" +
                        "Email: " + savedUser.getEmail() + "\n\n" +
                        "Votre compte est en attente de validation par l'administrateur.";

        emailService.SendSimpleMessage(savedUser.getEmail(), subject, text);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    @GetMapping
    public List<ExpertAgricole> AfficherExpertAgricole() {
        return expertAgricoleService.AfficherExpertAgricole();
    }

    @DeleteMapping("/{id}")
    public void SupprimerExpertAgricole(@PathVariable Long id) {
        expertAgricoleService.SupprimerExpertAgricole(id);
    }

    @GetMapping("/{id}")
    public Optional<ExpertAgricole> getExpertAgricoleById(@PathVariable Long id) {
        return expertAgricoleService.AfficherExpertAgricoleById(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> ModifierExpertAgricole(@PathVariable Long id, @RequestBody ExpertAgricole expertAgricole) {

        Optional<ExpertAgricole> optionalExpert = expertAgricoleRepository.findById(id);

        if (optionalExpert.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("ExpertAgricole not found");
        }

        ExpertAgricole expertDB = optionalExpert.get();

        expertDB.setNom(expertAgricole.getNom());
        expertDB.setPrenom(expertAgricole.getPrenom());
        expertDB.setEmail(expertAgricole.getEmail());
        expertDB.setAdresse(expertAgricole.getAdresse());
        expertDB.setTlf(expertAgricole.getTlf());

        if (expertAgricole.getMdp() != null && !expertAgricole.getMdp().isEmpty()) {
            expertDB.setMdp(bCryptPasswordEncoder.encode(expertAgricole.getMdp()));
        }

        ExpertAgricole updated = expertAgricoleRepository.save(expertDB);

        return ResponseEntity.status(HttpStatus.OK).body(updated);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginExpertAgricole(@RequestBody ExpertAgricole expertAgricole) {

        HashMap<String, Object> response = new HashMap<>();

        ExpertAgricole userFromDB = expertAgricoleRepository.findExpertAgricoleByEmail(expertAgricole.getEmail());

        if (userFromDB == null) {
            response.put("message", "ExpertAgricole not found!");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        boolean compare = bCryptPasswordEncoder.matches(expertAgricole.getMdp(), userFromDB.getMdp());

        if (!compare) {
            response.put("message", "Password incorrect!");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        if (!userFromDB.isEtat()) {
            response.put("message", "Votre compte n'est pas encore validé par l'administrateur.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        String token = Jwts.builder()
                .claim("data", userFromDB)
                .signWith(SignatureAlgorithm.HS256, "SECRET")
                .compact();

        response.put("token", token);
        response.put("role", "EXPERT_AGRICOLE");

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PutMapping("/updateEtat/{id}")
    public ResponseEntity<?> modifierEtatExpertAgricole(@PathVariable Long id, @RequestBody ExpertAgricole expertAgricole) {

        Optional<ExpertAgricole> optionalExpert = expertAgricoleRepository.findById(id);

        if (optionalExpert.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("ExpertAgricole not found");
        }

        ExpertAgricole expertDB = optionalExpert.get();

        boolean ancienEtat = expertDB.isEtat();
        boolean nouvelEtat = expertAgricole.isEtat();

        expertDB.setEtat(nouvelEtat);

        if (ancienEtat != nouvelEtat) {

            String etat =
                    nouvelEtat
                            ? "<strong style='color:green'>Accepté</strong>"
                            : "<strong style='color:red'>Bloqué</strong>";

            String messageHTML =
                    "<html>" +
                            "<body style='font-family:Arial'>" +
                            "<div style='background:#f5f5f5;padding:20px;border-radius:10px;width:400px;margin:auto'>" +
                            "<img src='cid:logoImage' style='width:150px;margin-bottom:20px'/>" +
                            "<h2>Etat de votre compte</h2>" +
                            "<p>Bonjour <b>" + expertDB.getNom() + "</b></p>" +
                            "<p>Votre compte est maintenant : " + etat + "</p>";

            if (nouvelEtat) {
                messageHTML +=
                        "<p>Vous pouvez maintenant vous connecter à votre compte.</p>" +
                                "<a href='http://localhost:4200/login'>" +
                                "<button style='padding:10px 20px;background:#28a745;color:white;border:none;border-radius:5px'>Connexion</button>" +
                                "</a>";
            }

            messageHTML += "</div></body></html>";

            try {

                MimeMessage message = emailService.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true);

                helper.setTo(expertDB.getEmail());
                helper.setSubject("Etat de votre compte SmartAgricole");
                helper.setText(messageHTML, true);

                helper.addInline("logoImage", new ClassPathResource("static/images/logo.png"));

                emailService.SendEmail(message);

            } catch (MessagingException e) {
                e.printStackTrace();
            }
        }

        ExpertAgricole saved = expertAgricoleRepository.save(expertDB);

        return ResponseEntity.status(HttpStatus.OK).body(saved);
    }
}