package com.example.Backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ClientSignupDTO {

    @NotBlank @Size(min = 3, max = 20)
    private String login;

    @NotBlank @Size(min = 6)
    private String motDePasse; // Should be plain text, hashed in application or procedure

    @NotBlank private String nom;
    @NotBlank private String prenom;
    @NotBlank private String telephone;
    @NotBlank @Email private String email;
    @NotBlank private String adresse;

    // Getters and Setters (omitted for brevity)
    // NOTE: Hashing logic should ideally happen in a service layer before calling the DB procedure.
    // For this example, we assume we pass a placeholder/raw hash value to the procedure.
    public String getLogin() { return login; }
    public void setLogin(String login) { this.login = login; }
    public String getMotDePasse() { return motDePasse; }
    public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }
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