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

    @Column(name = "is_read", columnDefinition = "boolean default false")
    private boolean isRead = false;

    @ManyToOne
    private Besoin besoin;

    @ManyToOne
    private Fournisseur fournisseur;
}
