package com.example.Backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "SERVICE")
public class Service {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "service_seq_gen")
    @SequenceGenerator(name = "service_seq_gen", sequenceName = "SERVICE_SEQ", allocationSize = 1)
    @Column(name = "SERVICE_ID")
    private Long serviceId;

    @Column(name = "LIBELLE", length = 50)
    private String libelle;

    @Column(name = "TARIF_UNITAIRE")
    private BigDecimal tarifUnitaire; // Use BigDecimal for currency

    // Default constructor (required by JPA)
    public Service() {}

    @ManyToMany(mappedBy = "services") // Specifies that the 'services' field in the Reservation class owns this relationship
    private List<Reservation> reservations;

    // Getters and Setters
    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
    public String getLibelle() { return libelle; }
    public void setLibelle(String libelle) { this.libelle = libelle; }
    public BigDecimal getTarifUnitaire() { return tarifUnitaire; }
    public void setTarifUnitaire(BigDecimal tarifUnitaire) { this.tarifUnitaire = tarifUnitaire; }
}