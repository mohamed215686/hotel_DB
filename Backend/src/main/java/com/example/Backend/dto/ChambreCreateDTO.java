package com.example.Backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class ChambreCreateDTO {

    @NotBlank(message = "Numero is required")
    @Size(max = 10)
    private String numero;

    @NotBlank(message = "Type is required")
    @Size(max = 50)
    private String type;

    @NotNull(message = "Prix Nuitee is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Price per night must be non-negative")
    private BigDecimal prixNuitee; // Matches the NUMBER CHECK (PRIX_NUITEE >= 0) constraint

    @NotBlank(message = "Statut is required")
    @Size(max = 20)
    private String statut; // e.g., 'Disponible', 'Occupée', 'Maintenance'

    // Getters and Setters (omitted for brevity)
    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public BigDecimal getPrixNuitee() { return prixNuitee; }
    public void setPrixNuitee(BigDecimal prixNuitee) { this.prixNuitee = prixNuitee; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
}