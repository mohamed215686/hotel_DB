package com.example.Backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "FACTURE")
public class Facture {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "facture_seq_gen")
    @SequenceGenerator(name = "facture_seq_gen", sequenceName = "FACTURE_SEQ", allocationSize = 1)
    @Column(name = "FACTURE_ID")
    private Long factureId;

    @Column(name = "MONT_TOTAL")
    private BigDecimal montTotal = BigDecimal.ZERO; // Maps to NUMBER DEFAULT 0

    @Column(name = "STATUT_PAIEMENT", length = 20)
    private String statutPaiement; // e.g., 'Payé', 'Non payé', 'En attente'

    @Column(name = "DATE_PAIEMENT")
    @Temporal(TemporalType.DATE)
    private Date datePaiement;

    @Column(name = "DATE_EMISSION")
    @Temporal(TemporalType.DATE)
    private Date dateEmission;

    // Default constructor (required by JPA)
    public Facture() {}

    // Getters and Setters
    public Long getFactureId() { return factureId; }
    public void setFactureId(Long factureId) { this.factureId = factureId; }
    public BigDecimal getMontTotal() { return montTotal; }
    public void setMontTotal(BigDecimal montTotal) { this.montTotal = montTotal; }
    public String getStatutPaiement() { return statutPaiement; }
    public void setStatutPaiement(String statutPaiement) { this.statutPaiement = statutPaiement; }
    public Date getDatePaiement() { return datePaiement; }
    public void setDatePaiement(Date datePaiement) { this.datePaiement = datePaiement; }
    public Date getDateEmission() { return dateEmission; }
    public void setDateEmission(Date dateEmission) { this.dateEmission = dateEmission; }
}