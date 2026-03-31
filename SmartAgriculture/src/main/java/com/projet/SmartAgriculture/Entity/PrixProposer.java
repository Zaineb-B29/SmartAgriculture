package com.projet.SmartAgriculture.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class PrixProposer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String Prix;

    @ManyToOne
    private Besoin besoin;

    @ManyToOne
    private Fournisseur fournisseur;
}
