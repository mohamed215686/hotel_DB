package com.example.Backend.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "CLIENT")
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "client_seq_gen")
    @SequenceGenerator(name = "client_seq_gen", sequenceName = "CLIENT_SEQ", allocationSize = 1)
    @Column(name = "CLIENT_ID")
    private Long clientId;

    // One-to-One or Many-to-One relationship to Utilisateur.
    // Since UTILISATEUR_ID is not NOT NULL, it's optional, but we'll use @OneToOne
    // since one user is typically one client in this context.
    @OneToOne
    @JoinColumn(name = "UTILISATEUR_ID", referencedColumnName = "UTILISATEUR_ID")
    private Utilisateur utilisateur;

    @Column(name = "NOM", length = 30)
    private String nom;

    @Column(name = "PRENOM", length = 30)
    private String prenom;

    @Column(name = "TELEPHONE", length = 10)
    private String telephone;

    @Column(name = "EMAIL", length = 100)
    private String email;

    @Column(name = "ADRESSE", length = 100)
    private String adresse;

    @Column(name = "DATE_INSCRIPTION")
    private Date dateInscription; // Stored as DATE in Oracle

    // Default constructor (required by JPA)
    public Client() {}

    // Getters and Setters (essential for JPA and JSON mapping)
    public Long getClientId() { return clientId; }
    public void setClientId(Long clientId) { this.clientId = clientId; }
    public Utilisateur getUtilisateur() { return utilisateur; }
    public void setUtilisateur(Utilisateur utilisateur) { this.utilisateur = utilisateur; }
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
    public Date getDateInscription() { return dateInscription; }
    public void setDateInscription(Date dateInscription) { this.dateInscription = dateInscription; }
}