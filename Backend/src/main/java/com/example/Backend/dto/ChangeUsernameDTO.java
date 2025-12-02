package com.example.Backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChangeUsernameDTO {

    @NotBlank(message = "Le nouveau nom d'utilisateur est obligatoire.")
    @Size(min = 3, max = 20, message = "Le nom d'utilisateur doit être entre 3 et 20 caractères.")
    private String newUsername;

    // Getters and Setters
    public String getNewUsername() { return newUsername; }
    public void setNewUsername(String newUsername) { this.newUsername = newUsername; }
}