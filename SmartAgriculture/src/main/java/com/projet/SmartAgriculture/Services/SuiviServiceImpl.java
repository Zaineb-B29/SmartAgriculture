package com.projet.SmartAgriculture.Services;

import com.projet.SmartAgriculture.Entity.Reserver;
import com.projet.SmartAgriculture.Entity.Suivi;
import com.projet.SmartAgriculture.Repository.ReserverRepository;
import com.projet.SmartAgriculture.Repository.SuiviRepository;
import com.projet.SmartAgriculture.Services.SuiviService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class SuiviServiceImpl implements SuiviService {

    @Autowired
    private SuiviRepository suiviRepository;

    @Autowired
    private ReserverRepository reserverRepository;

    @Override
    public Suivi createSuiviAvecUpload(Long reserverId, String typeSuivi,
                                       List<MultipartFile> avantFiles, List<MultipartFile> apresFiles) {

        Reserver reserver = reserverRepository.findById(reserverId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        Suivi suivi = new Suivi();
        suivi.setTypeSuivi(typeSuivi);
        suivi.setReserver(reserver);

        if (avantFiles != null) {
            suivi.setUrlsAvant(saveFiles(avantFiles));
        }

        if (apresFiles != null) {
            suivi.setUrlsApres(saveFiles(apresFiles));
        }

        return suiviRepository.save(suivi);
    }

    @Override
    public Suivi createSuiviTempsReel(Long reserverId) {
        Reserver reserver = reserverRepository.findById(reserverId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        Suivi suivi = new Suivi();
        suivi.setTypeSuivi("TEMPS_REEL");
        suivi.setReserver(reserver);

        String meetLink = "https://meet.google.com/" +
                UUID.randomUUID().toString().substring(0, 8);

        suivi.setLienTempsReel(meetLink);

        return suiviRepository.save(suivi);
    }

    private List<String> saveFiles(List<MultipartFile> files) {
        List<String> urls = new ArrayList<>();

        for (MultipartFile file : files) {
            String filename = UUID.randomUUID() + "-" + file.getOriginalFilename();
            String path = "D:/pfe/uploads/" + filename;

            try {
                file.transferTo(new File(path));
                urls.add("http://localhost:8081/uploads/" + filename);
            } catch (IOException e) {
                throw new RuntimeException("Failed to save file", e);
            }
        }

        return urls;
    }

    @Override
    public List<Suivi> getSuivisByClientId(Long clientId) {
        return suiviRepository.findSuivisByClientId(clientId);
    }

    @Override
    public List<Suivi> affichiersuivi() {
        return suiviRepository.findAll();
    }
}