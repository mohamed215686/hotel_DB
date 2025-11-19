package com.example.Backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Date; // Using java.util.Date for simplicity in DTO, though String is often used for date inputs

public class ReservationCreateDTO {

    @NotNull(message = "Client ID is required")
    private Long clientId;

    @NotNull(message = "Chambre ID is required")
    private Long chambreId;

    @NotNull(message = "Date Debut is required")
    private Date dateDebut;

    @NotNull(message = "Date Fin is required")
    private Date dateFin;

    @NotBlank(message = "Statut is required")
    private String statut;

    // Note: DATE_CREATION is typically handled by the backend (as seen in the controller)

    // Getters and Setters
    public Long getClientId() { return clientId; }
    public void setClientId(Long clientId) { this.clientId = clientId; }
    public Long getChambreId() { return chambreId; }
    public void setChambreId(Long chambreId) { this.chambreId = chambreId; }
    public Date getDateDebut() { return dateDebut; }
    public void setDateDebut(Date dateDebut) { this.dateDebut = dateDebut; }
    public Date getDateFin() { return dateFin; }
    public void setDateFin(Date dateFin) { this.dateFin = dateFin; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
}