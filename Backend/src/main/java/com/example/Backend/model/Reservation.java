package com.example.Backend.model;

import com.example.Backend.dto.ReservationCreateDTO;
import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "RESERVATION")
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "reservation_seq_gen")
    @SequenceGenerator(name = "reservation_seq_gen", sequenceName = "RESERVATION_SEQ", allocationSize = 1)
    @Column(name = "RES_ID")
    private Long resId;

    // 🚩 CHANGE 1: Use @Column and Long type instead of @ManyToOne Client entity
    @Column(name = "CLIENT_ID", nullable = false)
    private Long clientId;

    // 🚩 CHANGE 2: Use @Column and Long type instead of @ManyToOne Chambre entity
    @Column(name = "CHAMBRE_ID", nullable = false)
    private Long chambreId;

    @Column(name = "DATE_DEBUT")
    @Temporal(TemporalType.DATE)
    private Date dateDebut;

    @Column(name = "DATE_FIN")
    @Temporal(TemporalType.DATE)
    private Date dateFin;

    @Column(name = "STATUT", length = 20)
    private String statut;

    @Column(name = "DATE_CREATION")
    @Temporal(TemporalType.DATE)
    private Date dateCreation;

    // Default constructor (required by JPA)
    public Reservation() {}

    // 🚩 CHANGE 3: Update Getters and Setters to reflect Long types

    public Long getResId() { return resId; }
    public void setResId(Long resId) { this.resId = resId; }

    public Long getClientId() { return clientId; } // New Getter
    public void setClientId(Long clientId) { this.clientId = clientId; } // New Setter

    public Long getChambreId() { return chambreId; } // New Getter
    public void setChambreId(Long chambreId) { this.chambreId = chambreId; } // New Setter

    public Date getDateDebut() { return dateDebut; }
    public void setDateDebut(Date dateDebut) { this.dateDebut = dateDebut; }
    public Date getDateFin() { return dateFin; }
    public void setDateFin(Date dateFin) { this.dateFin = dateFin; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
    public Date getDateCreation() { return dateCreation; }
    public void setDateCreation(Date dateCreation) { this.dateCreation = dateCreation; }


    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "associe", // The name of your intermediate join table
            joinColumns = @JoinColumn(name = "RES_ID"), // The column in 'associe' that refers to THIS entity (Reservation)
            inverseJoinColumns = @JoinColumn(name = "SERVICE_ID") // The column in 'associe' that refers to the OTHER entity (Service)
    )
    private List<Service> services;

    // The method you were trying to implement:
    public List<Service> getServices() {
        return this.services;
    }
}