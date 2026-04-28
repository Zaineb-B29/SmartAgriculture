package com.projet.SmartAgriculture.Entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String contenu;
    private LocalDateTime dateEnvoi;

    // "ADMIN" | "CLIENT" | "EXPERT" | "FOURNISSEUR"
    private String expediteurType;
    private Long expediteurId;

    // "ADMIN" | "CLIENT" | "EXPERT" | "FOURNISSEUR"
    private String destinataireType;
    private Long destinataireId;

    private boolean lu = false;

    // Fichier joint
    private String fileUrl;
    private String typeMedia; // "IMAGE" | "VIDEO" | null
}