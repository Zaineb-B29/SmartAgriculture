package com.projet.SmartAgriculture.Entity;

import jakarta.persistence.*;
import lombok.Data;

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

    @ManyToOne
    private Client client;
}
