package com.example.Backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "UTILISATEUR")
public class Utilisateur {

    // ... (Primary Key setup is correct)
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "utilisateur_seq_gen")
    @SequenceGenerator(name = "utilisateur_seq_gen", sequenceName = "UTILISATEUR_SEQ", allocationSize = 1)
    @Column(name = "UTILISATEUR_ID")
    private Long utilisateurId;

    // 🚩 CORRECTION 1: Remove @ManyToOne and use @Column to map the raw ID.
    @Column(name = "ROLE_ID", nullable = false)
    private Long roleId; // Renamed to roleId for clarity (instead of just 'role')

    @Column(name = "LOGIN", length = 20)
    private String login;

    @Column(name = "MOTDEPASSEHASH", length = 20)
    private String motDePasseHash;

    @Column(name = "ACTIF", length = 1)
    private String actif;

    // Default constructor required by JPA
    public Utilisateur() {}

    // 🚩 CORRECTION 2: Update constructor to accept Long roleId
    public Utilisateur(Long roleId, String login, String motDePasseHash, String actif) {
        this.roleId = roleId;
        this.login = login;
        this.motDePasseHash = motDePasseHash;
        this.actif = actif;
    }


    public Long getUtilisateurId() { return utilisateurId; }
    public void setUtilisateurId(Long utilisateurId) { this.utilisateurId = utilisateurId; }
    public Long getRoleId() { return roleId; } // <-- New Getter
    public void setRoleId(Long roleId) { this.roleId = roleId; } // <-- New Setter

    public String getMotDePasseHash() {
        return motDePasseHash;
    }

    public void setMotDePasseHash(String motDePasseHash) {
        this.motDePasseHash = motDePasseHash;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getActif() {
        return actif;
    }

    public void setActif(String actif) {
        this.actif = actif;
    }
}