package com.projet.SmartAgriculture.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Reserver {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Client client;

    @ManyToOne
    private PrixProposer prixProposer;
}
