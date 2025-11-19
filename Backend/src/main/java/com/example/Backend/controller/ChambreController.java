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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/chambres")
public class ChambreController {

    @Autowired
    private ChambreRepository chambreRepository;

    // GET /chambres
    @GetMapping
    public List<Chambre> getAllChambres() {
        return chambreRepository.findAll();
    }

    // GET /chambres/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Chambre> getChambreById(@PathVariable Long id) {
        Chambre chambre = chambreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chambre not found with ID: " + id));
        return ResponseEntity.ok(chambre);
    }

    // POST /chambres
    @PostMapping("/add-procedure")
    @Transactional
    public ResponseEntity<String> createChambreUsingProcedure(@Valid @RequestBody ChambreCreateDTO dto) {

        chambreRepository.executeAddChambre(
                dto.getNumero(),
                dto.getType(),
                dto.getPrixNuitee(),
                dto.getStatut()
        );

        return new ResponseEntity<>("Chambre created via procedure: " + dto.getNumero(), HttpStatus.CREATED);
    }
}