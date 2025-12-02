package com.example.Backend.controller;

import com.example.Backend.dto.ChambreCreateDTO;
import com.example.Backend.exception.ResourceNotFoundException;
import com.example.Backend.model.Chambre;
import com.example.Backend.repository.ChambreRepository;
import jakarta.validation.Valid;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // Import for security
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/chambres")
public class ChambreController {

    @Autowired
    private ChambreRepository chambreRepository;

    // --- READ OPERATIONS (Accessible by Authenticated Users) ---

    // GET /chambres
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<Chambre> getAllChambres() {
        return chambreRepository.findAll();
    }

    // GET /chambres/{id}
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Chambre> getChambreById(@PathVariable Long id) {
        Chambre chambre = chambreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chambre not found with ID: " + id));
        return ResponseEntity.ok(chambre);
    }

    // --- WRITE OPERATIONS (Accessible by Admin/Manager) ---

    /**
     * 1. CREATE: Creates a new Chambre using standard JPA save.
     * Path: POST /chambres
     * Access limited to Admin/Manager.
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Chambre> createChambre(@Valid @RequestBody ChambreCreateDTO dto) {

        Chambre newChambre = new Chambre();
        // Use BeanUtils or manually map fields from the DTO to the new entity
        BeanUtils.copyProperties(dto, newChambre);

        // Handle creation logic (e.g., setting default status, if needed)

        Chambre savedChambre = chambreRepository.save(newChambre);
        return new ResponseEntity<>(savedChambre, HttpStatus.CREATED);
    }

    /* NOTE: The /add-procedure method is intentionally left out to promote the standard JPA method above.
    @PostMapping("/add-procedure")
    @Transactional
    public ResponseEntity<String> createChambreUsingProcedure(@Valid @RequestBody ChambreCreateDTO dto) {
        // ... (implementation using stored procedure) ...
    }
    */


    /**
     * 2. UPDATE: Updates an existing Chambre by ID.
     * Path: PUT /chambres/{id}
     * Access limited to Admin/Manager.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Chambre> updateChambre(@PathVariable Long id, @Valid @RequestBody ChambreCreateDTO dto) {

        Chambre chambre = chambreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chambre not found with ID: " + id));

        // Update properties from DTO
        BeanUtils.copyProperties(dto, chambre);
        chambre.setChambreId(id); // Ensure ID remains the original ID

        final Chambre updatedChambre = chambreRepository.save(chambre);
        return ResponseEntity.ok(updatedChambre);
    }

    /**
     * 3. DELETE: Deletes a Chambre by ID.
     * Path: DELETE /chambres/{id}
     * Access limited to Admin/Manager.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteChambre(@PathVariable Long id) {

        if (!chambreRepository.existsById(id)) {
            throw new ResourceNotFoundException("Chambre not found with ID: " + id);
        }

        // NOTE: This assumes no foreign key conflicts, or that cascading deletes are configured.
        chambreRepository.deleteById(id);
        return ResponseEntity.noContent().build(); // HTTP 204 No Content
    }
}