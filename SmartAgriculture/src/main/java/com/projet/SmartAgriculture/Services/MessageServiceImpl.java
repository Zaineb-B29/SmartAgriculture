package com.projet.SmartAgriculture.Services;

import com.projet.SmartAgriculture.Entity.Message;
import com.projet.SmartAgriculture.Repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageServiceImpl implements MessageService {

    @Autowired
    private MessageRepository messageRepository;

    private static final String UPLOAD_PATH = "../Frontend/src/assets/uploads/messages/";
    private static final String FILE_URL_PREFIX = "assets/uploads/messages/";

    @Override
    public List<Message> getConversation(String type1, Long id1, String type2, Long id2) {
        return messageRepository.findConversation(type1, id1, type2, id2);
    }

    @Override
    public Message envoyerMessage(String expediteurType, Long expediteurId,
                                  String destinataireType, Long destinataireId,
                                  String contenu) {
        Message msg = new Message();
        msg.setContenu(contenu);
        msg.setDateEnvoi(LocalDateTime.now());
        msg.setExpediteurType(expediteurType);
        msg.setExpediteurId(expediteurId);
        msg.setDestinataireType(destinataireType);
        msg.setDestinataireId(destinataireId);
        return messageRepository.save(msg);
    }

    @Override
    public Message envoyerMessageFichier(String expediteurType, Long expediteurId,
                                         String destinataireType, Long destinataireId,
                                         MultipartFile file, String contenu) throws IOException {
        String contentType = file.getContentType() != null ? file.getContentType() : "";
        String typeMedia;
        if (contentType.startsWith("image/")) {
            typeMedia = "IMAGE";
        } else if (contentType.startsWith("video/")) {
            typeMedia = "VIDEO";
        } else {
            throw new IllegalArgumentException("Type non supporté : " + contentType);
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get(UPLOAD_PATH);
        Files.createDirectories(uploadPath);
        Files.copy(file.getInputStream(), uploadPath.resolve(fileName),
                StandardCopyOption.REPLACE_EXISTING);

        Message msg = new Message();
        msg.setContenu(contenu != null ? contenu : "");
        msg.setFileUrl(FILE_URL_PREFIX + fileName);
        msg.setTypeMedia(typeMedia);
        msg.setDateEnvoi(LocalDateTime.now());
        msg.setExpediteurType(expediteurType);
        msg.setExpediteurId(expediteurId);
        msg.setDestinataireType(destinataireType);
        msg.setDestinataireId(destinataireId);
        return messageRepository.save(msg);
    }

    @Override
    public void marquerLus(String readerType, Long readerId, String otherType, Long otherId) {
        List<Message> messages = messageRepository
                .findUnreadInConversation(readerType, readerId, otherType, otherId);
        messages.forEach(m -> m.setLu(true));
        messageRepository.saveAll(messages);
    }

    @Override
    public List<Message> getUnreadFor(String type, Long id) {
        return messageRepository.findUnreadFor(type, id);
    }

    @Override
    public void supprimerMessage(Long id) {
        messageRepository.deleteById(id);
    }
}