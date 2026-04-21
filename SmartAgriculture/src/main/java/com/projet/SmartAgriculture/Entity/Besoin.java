package com.projet.SmartAgriculture.Entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Besoin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String image;

    private String description;
    private String type;
    private String nombreArbres;
    private String lieu;
    private String metrage;
    private String descriptionExpert;
    private boolean etat;

    private String statut;
    private LocalDateTime dateSoumission;
    private LocalDateTime dateValidationExpert;

    @ManyToOne
    private Client client;

    @ManyToOne
    private ExpertAgricole expert;
}