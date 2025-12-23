package com.example.Backend.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Backend.dto.LigneFactureCreateDTO;
import com.example.Backend.exception.ResourceNotFoundException; // Used for findById
import com.example.Backend.model.LigneFacture;
import com.example.Backend.repository.FactureRepository;
import com.example.Backend.repository.LigneFactureRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/lignes-facture")
public class LigneFactureController {

    @Autowired
    private LigneFactureRepository ligneFactureRepository;

    @Autowired
    private FactureRepository factureRepository; // Kept for existence check and updating total

    @PostMapping("/add-procedure")
    @Transactional
    public ResponseEntity<String> createLigneFactureUsingProcedure(@Valid @RequestBody LigneFactureCreateDTO dto) {

        Long factureId = dto.getFactureId();
        if (!factureRepository.existsById(factureId)) {
            throw new ResourceNotFoundException("Facture not found with ID: " + factureId);
        }

        BigDecimal sousTotal = dto.getPrixUnitaire().multiply(BigDecimal.valueOf(dto.getQuantite()));

        ligneFactureRepository.executeAddLigneFacture(
                factureId,
                dto.getDescription(),
                dto.getQuantite(),
                dto.getPrixUnitaire(),
                sousTotal
        );

        // NOTE: In a real app, you would still need to update the parent FACTURE total here.

        return new ResponseEntity<>("LigneFacture created via procedure for Facture ID: " + factureId, HttpStatus.CREATED);
    }

    @GetMapping("/facture/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','MANAGER','Réceptionniste')")
    public ResponseEntity<?> getLignesByFactureId(@PathVariable Long id) {
        try {
            List<LigneFacture> lignes = ligneFactureRepository.findByFactureId(id);
            return ResponseEntity.ok(lignes);
        } catch (Exception e) {
            // Return a helpful error message instead of an unhandled 500
            String msg = "Error fetching ligne factures: " + e.getMessage();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(msg);
        }
    }
}