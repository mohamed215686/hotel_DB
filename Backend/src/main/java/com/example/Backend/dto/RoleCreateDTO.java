package com.example.Backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RoleCreateDTO {

    // Ensure NOMROLE is not empty and respects the database size constraint (20)
    @NotBlank(message = "Role Name (NOMROLE) is required")
    @Size(max = 20, message = "Role Name cannot exceed 20 characters")
    private String nomRole;

    // Ensure DESCRIPTION is not empty and respects the database size constraint (30)
    @NotBlank(message = "Role Description is required")
    @Size(max = 30, message = "Description cannot exceed 30 characters")
    private String description;

    // Default constructor
    public RoleCreateDTO() {}

    // Getters and Setters
    public String getNomRole() {
        return nomRole;
    }

    public void setNomRole(String nomRole) {
        this.nomRole = nomRole;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}