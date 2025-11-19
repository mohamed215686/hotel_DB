package com.example.Backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "LIGNE_FACTURE")
public class LigneFacture {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ligne_facture_seq_gen")
    @SequenceGenerator(name = "ligne_facture_seq_gen", sequenceName = "LIGNE_FACTURE_SEQ", allocationSize = 1)
    @Column(name = "DETAIL_ID")
    private Long detailId;

    // 🚩 CHANGE 1: Use @Column and Long type instead of @ManyToOne Facture entity
    @Column(name = "FACTURE_ID", nullable = false)
    private Long factureId; // Renamed to clearly indicate it's the ID

    @Column(name = "DESCRIPTION", length = 200)
    private String description;

    @Column(name = "QUANTITE")
    private Integer quantite;

    @Column(name = "PRIX_UNITAIRE")
    private BigDecimal prixUnitaire;

    @Column(name = "SOUS_TOTAL")
    private BigDecimal sousTotal;

    // Default constructor (required by JPA)
    public LigneFacture() {}

    // Getters and Setters
    public Long getDetailId() { return detailId; }
    public void setDetailId(Long detailId) { this.detailId = detailId; }

    // 🚩 CHANGE 2: New Getter and Setter for Long factureId
    public Long getFactureId() { return factureId; }
    public void setFactureId(Long factureId) { this.factureId = factureId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getQuantite() { return quantite; }
    public void setQuantite(Integer quantite) { this.quantite = quantite; }
    public BigDecimal getPrixUnitaire() { return prixUnitaire; }
    public void setPrixUnitaire(BigDecimal prixUnitaire) { this.prixUnitaire = prixUnitaire; }
    public BigDecimal getSousTotal() { return sousTotal; }
    public void setSousTotal(BigDecimal sousTotal) { this.sousTotal = sousTotal; }
}