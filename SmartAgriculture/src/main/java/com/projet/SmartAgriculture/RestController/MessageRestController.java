package com.projet.SmartAgriculture.RestController;

import com.projet.SmartAgriculture.Entity.Message;
import com.projet.SmartAgriculture.Services.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/message")
@CrossOrigin("*")
public class MessageRestController {

    @Autowired
    MessageService messageService;

    // GET conversation between two actors
    // e.g. GET /message/conversation?type1=ADMIN&id1=1&type2=CLIENT&id2=5
    @GetMapping("/conversation")
    public List<Message> getConversation(
            @RequestParam String type1, @RequestParam Long id1,
            @RequestParam String type2, @RequestParam Long id2) {
        return messageService.getConversation(type1, id1, type2, id2);
    }

    // POST text message
    @PostMapping
    public Message envoyerMessage(
            @RequestParam String expediteurType,
            @RequestParam Long expediteurId,
            @RequestParam String destinataireType,
            @RequestParam Long destinataireId,
            @RequestParam String contenu) {
        return messageService.envoyerMessage(
                expediteurType, expediteurId, destinataireType, destinataireId, contenu);
    }

    // POST file message (image/video)
    @PostMapping("/fichier")
    public ResponseEntity<Message> envoyerFichier(
            @RequestParam String expediteurType,
            @RequestParam Long expediteurId,
            @RequestParam String destinataireType,
            @RequestParam Long destinataireId,
            @RequestParam MultipartFile file,
            @RequestParam(required = false, defaultValue = "") String contenu) {
        try {
            Message msg = messageService.envoyerMessageFichier(
                    expediteurType, expediteurId, destinataireType, destinataireId, file, contenu);
            return ResponseEntity.ok(msg);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // PATCH mark messages as read
    @PatchMapping("/mark-read")
    public ResponseEntity<Void> marquerLus(
            @RequestParam String readerType, @RequestParam Long readerId,
            @RequestParam String otherType,  @RequestParam Long otherId) {
        messageService.marquerLus(readerType, readerId, otherType, otherId);
        return ResponseEntity.ok().build();
    }

    // GET unread count/messages for any actor
    // e.g. GET /message/unread?type=ADMIN&id=1
    @GetMapping("/unread")
    public ResponseEntity<List<Message>> getUnread(
            @RequestParam String type, @RequestParam Long id) {
        return ResponseEntity.ok(messageService.getUnreadFor(type, id));
    }

    // DELETE single message
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerMessage(@PathVariable Long id) {
        messageService.supprimerMessage(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/conversation")
    public ResponseEntity<Void> supprimerConversation(
            @RequestParam String type1, @RequestParam Long id1,
            @RequestParam String type2, @RequestParam Long id2) {

        List<Message> messages = messageService.getConversation(type1, id1, type2, id2);
        messages.forEach(m -> messageService.supprimerMessage(m.getId()));

        return ResponseEntity.ok().build();
    }
}