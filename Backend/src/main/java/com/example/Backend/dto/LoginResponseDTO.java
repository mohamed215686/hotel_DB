package com.example.Backend.dto;

public class LoginResponseDTO {
    private Long utilisateurId;
    private Long roleId;
    private String username;
    private String roleName;
    private String message;

    public LoginResponseDTO(Long utilisateurId, Long roleId, String username, String roleName) {
        this.utilisateurId = utilisateurId;
        this.roleId = roleId;
        this.username = username;
        this.roleName = roleName;
        this.message = "Authentification réussie.";
    }

    // Getters and Setters (omitted for brevity)
    public Long getUtilisateurId() { return utilisateurId; }
    public void setUtilisateurId(Long utilisateurId) { this.utilisateurId = utilisateurId; }
    public Long getRoleId() { return roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}