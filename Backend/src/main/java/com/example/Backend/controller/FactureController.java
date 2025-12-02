package com.example.Backend.controller;

import com.example.Backend.dto.LigneFactureCreateDTO;
import com.example.Backend.model.Facture;
import com.example.Backend.repository.FactureRepository;
import com.example.Backend.exception.ResourceNotFoundException;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.dao.DataIntegrityViolationException;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.List;

@RestController
@RequestMapping("/factures")
public class FactureController {

    @Autowired
    private FactureRepository factureRepository;

    // --- Helper for PL/SQL Error Handling (similar to ServiceController) ---
    private ResponseEntity<String> handleProcedureError(Exception e) {
        String errorMessage = "Erreur inattendue lors de l'opération.";

        if (e.getCause() != null && e.getCause() instanceof SQLException) {
            SQLException sqlEx = (SQLException) e.getCause();
            if (sqlEx.getMessage() != null) {
                if (sqlEx.getMessage().contains("ORA-20001") || sqlEx.getMessage().contains("existe deja")) {
                    errorMessage = "Erreur: Une facture existe déjà pour cette réservation.";
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(errorMessage);
                } else if (sqlEx.getMessage().contains("ORA-20002") || sqlEx.getMessage().contains("non trouvee")) {
                    errorMessage = "Erreur: Facture non trouvée.";
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorMessage);
                }
                errorMessage = sqlEx.getMessage();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorMessage);
            }
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorMessage);
    }

    // ----------------------------------------------------------------------
    // --- READ ENDPOINTS (Staff and potentially Client) ---
    // ----------------------------------------------------------------------

    // Retrieves a single facture by ID.
    // Security check (Staff OR Invoice Owner) would typically be required here,
    // but we'll stick to basic findById for simplicity in this file.
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('Admin') or hasAuthority('MANAGER') or hasAuthority('Réceptionniste')") // Staff Access
    public ResponseEntity<Facture> getFactureById(@PathVariable Long id) {
        return factureRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Facture non trouvée avec ID: " + id));
    }

    // ----------------------------------------------------------------------
    // --- WRITE ENDPOINTS (Staff Only) ---
    // ----------------------------------------------------------------------

    /**
     * Creates a new invoice for a given reservation ID using PRC_CREER_FACTURE.
     * Access limited to Staff.
     */
    @PostMapping("/reservation/{resId}")
    @PreAuthorize("hasAuthority('Admin') or hasAuthority('Manager') or hasAuthority('Réceptionniste')")
    public ResponseEntity<String> createFacture(@PathVariable Long resId) {
        try {
            // CALLS P_GENERATE_FACTURE and receives the String message
            String message = factureRepository.executeGenerateFacture(resId);

            if (message.startsWith("Erreur:")) {
                // If the procedure returns an explicit business error message
                return ResponseEntity.status(HttpStatus.CONFLICT).body(message);
            }

            // Success response (message contains the new facture ID)
            return ResponseEntity.status(HttpStatus.CREATED).body(message);
        } catch (Exception e) {
            return handleProcedureError(e); // Handles unexpected SQL/database errors
        }
    }



    /**
     * Records payment for a facture using PRC_ENREGISTRER_PAIEMENT.
     * Access limited to Staff.
     */
    @PostMapping("/{id}/payer")
    @PreAuthorize("hasAuthority('Admin') or hasAuthority('Manager') or hasAuthority('Réceptionniste')")
    public ResponseEntity<String> enregistrerPaiement(@PathVariable Long id) {
        try {
            // CALLS P_MARK_FACTURE_PAID and receives the String message
            String message = factureRepository.executeMarkFacturePaid(id);

            if (message.startsWith("Erreur:")) {
                // If the procedure returns an explicit business error message
                if (message.contains("Facture introuvable")) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(message);
                }
                return ResponseEntity.badRequest().body(message);
            }

            // Success response
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return handleProcedureError(e); // Handles unexpected SQL/database errors
        }
    }



}