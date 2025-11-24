package com.example.Backend.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

// Note: This class needs to reference the Role model for the role name.

public class UtilisateurDetails implements UserDetails {

    private Utilisateur utilisateur;
    private String roleName;

    public UtilisateurDetails(Utilisateur utilisateur, String roleName) {
        this.utilisateur = utilisateur;
        this.roleName = roleName;
    }

    // --- Core UserDetails Methods ---

    // Returns the user's authorities/roles
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // 🚩 FIX 1: Remove the "ROLE_" prefix and use the roleName directly.
        // Spring Security will automatically treat this as an authority.
        // We still uppercase it for standard convention matching.
        return Collections.singletonList(
                new SimpleGrantedAuthority(this.roleName.toUpperCase())
        );
    }

    @Override
    public String getPassword() {
        // Use the hashed password from your database column
        return utilisateur.getMotDePasseHash();
    }

    @Override
    public String getUsername() {
        // Use the LOGIN column as the username
        return utilisateur.getLogin();
    }

    // --- Account Status (based on ACTIF column) ---
    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() {
        return "Y".equalsIgnoreCase(utilisateur.getActif());
    }

    // --- Custom Method to get your database ID ---
    public Long getUtilisateurId() {
        return utilisateur.getUtilisateurId();
    }
}