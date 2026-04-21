package com.projet.SmartAgriculture.Services;
import com.projet.SmartAgriculture.Entity.Suivi;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface SuiviService {
    Suivi createSuiviAvecUpload(Long reservationId, String typeSuivi, List<MultipartFile> avantFiles, List<MultipartFile> apresFiles);
    Suivi createSuiviTempsReel(Long reservationId);
    List<Suivi> getSuivisByClientId(Long clientId);
    List<Suivi> affichiersuivi();
}
