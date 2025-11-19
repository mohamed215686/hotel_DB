package com.example.Backend.controller;

import com.example.Backend.dto.LigneFactureCreateDTO;
import com.example.Backend.exception.ResourceNotFoundException;
import com.example.Backend.model.LigneFacture;
import com.example.Backend.repository.FactureRepository;
import com.example.Backend.repository.LigneFactureRepository;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.Optional; // Used for findById

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
}