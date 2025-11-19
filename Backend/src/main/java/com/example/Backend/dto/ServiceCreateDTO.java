package com.example.Backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class ServiceCreateDTO {

    @NotBlank(message = "Libelle is required")
    @Size(max = 50)
    private String libelle;

    @NotNull(message = "Tarif Unitaire is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Tariff must be non-negative")
    private BigDecimal tarifUnitaire;

    // Getters and Setters
    public String getLibelle() { return libelle; }
    public void setLibelle(String libelle) { this.libelle = libelle; }
    public BigDecimal getTarifUnitaire() { return tarifUnitaire; }
    public void setTarifUnitaire(BigDecimal tarifUnitaire) { this.tarifUnitaire = tarifUnitaire; }
}