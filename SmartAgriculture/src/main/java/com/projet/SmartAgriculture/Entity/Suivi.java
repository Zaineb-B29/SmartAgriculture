package com.projet.SmartAgriculture.Entity;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
public class Suivi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String typeSuivi;

    @ElementCollection
    private List<String> urlsAvant;

    @ElementCollection
    private List<String> urlsApres;

    private String lienTempsReel;

    @ManyToOne
    private Reserver reserver;

}