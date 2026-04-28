package com.projet.SmartAgriculture.Services;

import com.projet.SmartAgriculture.Entity.Message;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

public interface MessageService {

    List<Message> getConversation(String type1, Long id1, String type2, Long id2);

    Message envoyerMessage(String expediteurType, Long expediteurId,
                           String destinataireType, Long destinataireId,
                           String contenu);

    Message envoyerMessageFichier(String expediteurType, Long expediteurId,
                                  String destinataireType, Long destinataireId,
                                  MultipartFile file, String contenu) throws IOException;

    void marquerLus(String readerType, Long readerId, String otherType, Long otherId);

    List<Message> getUnreadFor(String type, Long id);

    void supprimerMessage(Long id);
}