package com.example.Backend.controller;

import com.example.Backend.dto.FactureCreateDTO;
import com.example.Backend.exception.ResourceNotFoundException;
import com.example.Backend.model.Facture;
import com.example.Backend.model.UtilisateurDetails;
import com.example.Backend.repository.FactureRepository;
import jakarta.validation.Valid;
import com.example.Backend.service.AuditService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/factures")
public class FactureController {

    @Autowired
    private FactureRepository factureRepository;

    @PostMapping("/add-procedure")
    @Transactional
    public ResponseEntity<String> createFactureUsingProcedure(@Valid @RequestBody FactureCreateDTO dto) {

        factureRepository.executeAddFacture(
                dto.getStatutPaiement(),
                dto.getDatePaiement(),
                dto.getDateEmission()
        );

        return new ResponseEntity<>("Facture created via procedure with status: " + dto.getStatutPaiement(), HttpStatus.CREATED);
    }


// ... other necessary imports (FactureRepository, AuditService, etc.)
// Assume AuditService and FactureRepository are autowired
    @Autowired // <-- This tells Spring to create and inject an instance
    private AuditService auditService;


    @GetMapping("/{id}")
    public ResponseEntity<Facture> getFactureById(
            @PathVariable Long id,
            @AuthenticationPrincipal UtilisateurDetails currentUser) { // <-- Added principal here

        System.out.println("\n--- FactureController: GET /factures/" + id + " ---");
        System.out.println("--- Principal Authenticated: " + currentUser.getUsername() + " ---");
        System.out.println("--- Principal Role: " + currentUser.getAuthorities().iterator().next().getAuthority() + " ---");

        Facture facture = factureRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Facture not found with id: " + id));

        System.out.println("--- FactureController: SUCCESS - Retrieved Facture ID: " + facture.getFactureId() + " ---");

        return ResponseEntity.ok(facture);
    }
}