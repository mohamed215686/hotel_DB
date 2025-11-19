package com.example.Backend.controller;

// ... imports

import com.example.Backend.dto.UtilisateurCreateDTO;
import com.example.Backend.exception.ResourceNotFoundException;
import com.example.Backend.model.Utilisateur;
import com.example.Backend.repository.RoleRepository;
import com.example.Backend.repository.UtilisateurRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/utilisateurs")
public class UtilisateurController {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    // 🚩 CORRECTION: RoleRepository is now only needed for validation
    @Autowired
    private RoleRepository roleRepository;

    @PostMapping("/add-procedure")
    @Transactional
    public ResponseEntity<String> createUtilisateurUsingProcedure(@Valid @RequestBody UtilisateurCreateDTO dto) {

        if (!roleRepository.existsById(dto.getRoleId())) {
            throw new ResourceNotFoundException("Role not found with ID: " + dto.getRoleId());
        }

        utilisateurRepository.executeAddUtilisateur(
                dto.getRoleId(),
                dto.getLogin(),
                dto.getMotDePasseHash(),
                "Y" // Default status
        );

        return new ResponseEntity<>("Utilisateur created via procedure: " + dto.getLogin(), HttpStatus.CREATED);
    }
}