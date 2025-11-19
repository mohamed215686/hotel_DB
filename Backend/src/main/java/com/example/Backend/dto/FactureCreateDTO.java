package com.example.Backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.Date;

public class FactureCreateDTO {

    // Total might be calculated on the backend, but we include it for updates/manual creation
    @DecimalMin(value = "0.0", inclusive = true, message = "Total must be non-negative")
    private BigDecimal montTotal = BigDecimal.ZERO;

    @NotBlank(message = "Statut Paiement is required")
    @Size(max = 20)
    private String statutPaiement;

    // Optional: Date Paiement is null if not paid
    private Date datePaiement;

    @NotNull(message = "Date Emission is required")
    private Date dateEmission;

    // Getters and Setters
    public BigDecimal getMontTotal() { return montTotal; }
    public void setMontTotal(BigDecimal montTotal) { this.montTotal = montTotal; }
    public String getStatutPaiement() { return statutPaiement; }
    public void setStatutPaiement(String statutPaiement) { this.statutPaiement = statutPaiement; }
    public Date getDatePaiement() { return datePaiement; }
    public void setDatePaiement(Date datePaiement) { this.datePaiement = datePaiement; }
    public Date getDateEmission() { return dateEmission; }
    public void setDateEmission(Date dateEmission) { this.dateEmission = dateEmission; }
}