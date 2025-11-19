package com.example.Backend.controller;

import com.example.Backend.dto.FactureCreateDTO;
import com.example.Backend.exception.ResourceNotFoundException;
import com.example.Backend.model.Facture;
import com.example.Backend.repository.FactureRepository;
import jakarta.validation.Valid;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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
}