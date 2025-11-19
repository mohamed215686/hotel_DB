package com.example.Backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ClientCreateDTO {

    // Optional: ID of the linked user account (if client is registering)
    private Long utilisateurId;

    @NotBlank(message = "Nom is required")
    @Size(max = 30)
    private String nom;

    @NotBlank(message = "Prenom is required")
    @Size(max = 30)
    private String prenom;

    @Size(max = 10, message = "Telephone must be 10 characters max")
    private String telephone; // Not mandatory, so no @NotBlank

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Size(max = 100)
    private String email;

    @Size(max = 100)
    private String adresse; // Not mandatory

    // Getters and Setters (omitted for brevity)
    public Long getUtilisateurId() { return utilisateurId; }
    public void setUtilisateurId(Long utilisateurId) { this.utilisateurId = utilisateurId; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }
}