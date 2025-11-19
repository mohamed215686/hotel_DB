package com.example.Backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "CHAMBRE")
public class Chambre {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "chambre_seq_gen")
    @SequenceGenerator(name = "chambre_seq_gen", sequenceName = "CHAMBRE_SEQ", allocationSize = 1)
    @Column(name = "CHAMBRE_ID")
    private Long chambreId;

    @Column(name = "NUMERO", length = 10)
    private String numero;

    @Column(name = "TYPE", length = 50)
    private String type;

    @Column(name = "PRIX_NUITEE")
    private BigDecimal prixNuitee; // Use BigDecimal for currency/floating-point numbers

    @Column(name = "STATUT", length = 20)
    private String statut;

    // Default constructor (required by JPA)
    public Chambre() {}

    // Getters and Setters (essential for JPA and JSON mapping)
    public Long getChambreId() { return chambreId; }
    public void setChambreId(Long chambreId) { this.chambreId = chambreId; }
    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public BigDecimal getPrixNuitee() { return prixNuitee; }
    public void setPrixNuitee(BigDecimal prixNuitee) { this.prixNuitee = prixNuitee; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
}