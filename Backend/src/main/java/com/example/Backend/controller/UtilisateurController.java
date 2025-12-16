package com.example.Backend.controller;

// ... imports

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Backend.dto.UtilisateurCreateDTO;
import com.example.Backend.exception.ResourceNotFoundException;
import com.example.Backend.model.Utilisateur;
import com.example.Backend.repository.UtilisateurRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/utilisateurs")
public class UtilisateurController {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    // 🚩 CORRECTION: RoleRepository is now only needed for validation
    // @Autowired
    // private RoleRepository roleRepository;

    // Helper to process the procedure's output message
    private ResponseEntity<String> handleProcedureMessage(String message) {
        if (message.startsWith("Erreur:")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(message);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    /**
     * List all utilisateurs (ADMIN only)
     */
    @GetMapping("")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<Utilisateur>> getAllUtilisateurs() {
        List<Utilisateur> list = utilisateurRepository.findAll();
        return ResponseEntity.ok(list);
    }

    /**
     * Get a single utilisateur by id (ADMIN only)
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Utilisateur> getUtilisateur(@PathVariable Long id) {
        return utilisateurRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec id: " + id));
    }

    /**
     * Delete a utilisateur (ADMIN only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> deleteUtilisateur(@PathVariable Long id) {
        if (!utilisateurRepository.existsById(id)) {
            throw new ResourceNotFoundException("Utilisateur non trouvé avec id: " + id);
        }
        utilisateurRepository.deleteById(id);
        return ResponseEntity.ok("Utilisateur supprimé avec succès.");
    }

    /**
     * Adds a new Utilisateur (Staff account) using the PL/SQL procedure.
     * Access limited to ADMIN.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> addUtilisateur(@Valid @RequestBody UtilisateurCreateDTO dto) {

        // Note: In a secure application, you MUST hash the password here 
        // before passing it to the database. We use the DTO's value directly
        // because the provided DTO field is named motDePasseHash.

        try {
            String message = utilisateurRepository.executeAddUtilisateur(
                    dto.getRoleId(),
                    dto.getLogin(),
                    dto.getMotDePasseHash()
            );

            return handleProcedureMessage(message);

        } catch (Exception e) {
            // Catch database connection or unexpected persistence errors
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur serveur lors de l'ajout de l'utilisateur: " + e.getMessage());
        }
    }


}