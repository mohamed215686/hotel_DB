package com.example.Backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UtilisateurCreateDTO {

    @NotBlank(message = "Login is required")
    @Size(max = 20, message = "Login cannot exceed 20 characters")
    private String login;

    @NotBlank(message = "Password Hash (or raw password) is required")
    @Size(max = 20, message = "Password hash cannot exceed 20 characters")
    private String motDePasseHash;

    // Use the ID of the Role for creation, not the whole Role object
    @NotNull(message = "Role ID is required")
    private Long roleId;

    // Getters and Setters
    public String getLogin() { return login; }
    public void setLogin(String login) { this.login = login; }
    public String getMotDePasseHash() { return motDePasseHash; }
    public void setMotDePasseHash(String motDePasseHash) { this.motDePasseHash = motDePasseHash; }
    public Long getRoleId() { return roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }
}