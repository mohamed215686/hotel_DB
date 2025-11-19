package com.example.Backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ROLE")
public class Role {

    // **Oracle Sequence Setup**
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "role_seq_gen")
    @SequenceGenerator(name = "role_seq_gen", sequenceName = "ROLE_SEQ", allocationSize = 1)
    @Column(name = "ROLE_ID")
    private Long roleId;

    @Column(name = "NOMROLE", length = 20)
    private String nomRole;

    @Column(name = "DESCRIPTION", length = 30)
    private String description;

    // Default constructor is required by JPA
    public Role() {}

    // Getters and Setters (Omitted for brevity, but required)
    // ...
    public Long getRoleId() { return roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }
    public String getNomRole() { return nomRole; }
    public void setNomRole(String nomRole) { this.nomRole = nomRole; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}