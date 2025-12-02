package com.example.Backend.controller;

import com.example.Backend.dto.ServiceCreateDTO;
import com.example.Backend.exception.ResourceNotFoundException;
import com.example.Backend.model.Service;
import com.example.Backend.repository.ServiceRepository;
import jakarta.validation.Valid;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/services")
public class ServiceController {

    @Autowired
    private ServiceRepository serviceRepository;


    private ResponseEntity<String> handleProcedureError(Exception e) {
        String errorMessage = "Erreur inattendue lors de l'opération.";

        // Check for specific Oracle error messages
        if (e.getCause() != null && e.getCause() instanceof SQLException) {
            SQLException sqlEx = (SQLException) e.getCause();
            if (sqlEx.getMessage() != null) {
                // Error parsing for ORA-20008 (Service exists), ORA-20006 (ID inexistant), etc.
                if (sqlEx.getMessage().contains("ORA-20008") || sqlEx.getMessage().contains("existe deja")) {
                    errorMessage = "Erreur: Ce service existe déjà.";
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(errorMessage);
                } else if (sqlEx.getMessage().contains("ORA-20006") || sqlEx.getMessage().contains("inexistant")) {
                    errorMessage = "Erreur: Cet ID service est inexistant.";
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorMessage);
                } else if (sqlEx.getMessage().contains("ORA-20007") || sqlEx.getMessage().contains("suppression impossible")) {
                    errorMessage = "Erreur: Suppression impossible car ce service est associé à une réservation.";
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(errorMessage);
                } else if (sqlEx.getMessage().contains("ORA-20004") || sqlEx.getMessage().contains("négatif")) {
                    errorMessage = "Erreur : Le tarif unitaire ne peut pas être négatif.";
                    return ResponseEntity.badRequest().body(errorMessage);
                }
                // Fallback to generic message with specific PL/SQL error
                errorMessage = sqlEx.getMessage();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorMessage);
            }
        }

        // Generic fallback
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorMessage);
    }

    @GetMapping
    public ResponseEntity<List<Service>> getAllServices() {
        // No security check needed; all services can be publicly listed.
        List<Service> services = serviceRepository.findAll();
        return ResponseEntity.ok(services);
    }

    /**
     * Retrieves a single service by its ID.
     * Open access.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Service> getServiceById(@PathVariable("id") Long id) {
        // No security check needed.
        Optional<Service> serviceOpt = serviceRepository.findById(id);

        if (serviceOpt.isEmpty()) {
            // Throwing your custom exception for 404
            throw new ResourceNotFoundException("Service non trouvé avec ID: " + id);
        }

        return ResponseEntity.ok(serviceOpt.get());
    }



    @PostMapping("/addsevice")
    @PreAuthorize("hasAuthority('Admin') or hasAuthority('MANAGER') or hasAuthority('Réceptionniste')")
    public ResponseEntity<String> addService(
            @Valid @RequestBody ServiceCreateDTO serviceDto) { // Key change here

        String libelle = serviceDto.getLibelle();
        BigDecimal tarif = serviceDto.getTarifUnitaire();

        try {
            // Use the DTO fields when calling the repository procedure
            serviceRepository.executeAjouterService(libelle, tarif);

            return ResponseEntity.status(HttpStatus.CREATED).body("Service " + libelle + " ajouté avec succès.");
        } catch (Exception e) {
            return handleProcedureError(e);
        }
    }

    /**
     * Deletes a service using the supprimer_service PL/SQL procedure.
     * Access limited to Staff roles.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('Admin') or hasAuthority('MANAGER') or hasAuthority('Réceptionniste')")
    public ResponseEntity<String> deleteService(@PathVariable("id") Long id) {

        try {
            // Calls the @Procedure method defined in the repository
            serviceRepository.executeSupprimerService(id);
            return ResponseEntity.ok("Service avec ID " + id + " supprimé avec succès.");
        } catch (Exception e) {
            // Catch exceptions thrown by the PL/SQL procedure
            return handleProcedureError(e);
        }
    }

}