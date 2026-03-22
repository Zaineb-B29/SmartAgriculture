package com.projet.SmartAgriculture.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;
import java.util.UUID;
@Entity
@Data
public class ConfirmationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name="token_id")
    private Long tokenId;

    @Column(name="confirmation_token")
    private String confirmationToken;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @OneToOne(targetEntity = Fournisseur.class, fetch = FetchType.LAZY,cascade = CascadeType.ALL,orphanRemoval = true)
    @JoinColumn(nullable = false, name = "fournisseur_id")
    private Fournisseur fournisseur;



    public ConfirmationToken(Fournisseur fournisseur) {
        this.fournisseur = fournisseur;
        createdDate = new Date();
        confirmationToken = UUID.randomUUID().toString();
    }

    public ConfirmationToken(Long tokenId, String confirmationToken, Date createdDate, Fournisseur fournisseur) {
        this.tokenId = tokenId;
        this.confirmationToken = confirmationToken;
        this.createdDate = createdDate;
        this.fournisseur = fournisseur;
    }

    public ConfirmationToken() { //il faut mettre un constructor complet et vide
    }
}
