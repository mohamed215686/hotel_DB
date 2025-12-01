package com.example.Backend.controller;

import com.example.Backend.dto.ClientCreateDTO;
import com.example.Backend.exception.ResourceNotFoundException;
import com.example.Backend.model.Client;
import com.example.Backend.model.Utilisateur;
import com.example.Backend.repository.ClientRepository;
import com.example.Backend.repository.UtilisateurRepository;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/clients")
public class ClientController {

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    // GET /clients
    @GetMapping
    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    // GET /clients/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Client> getClientById(@PathVariable Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with ID: " + id));
        return ResponseEntity.ok(client);
    }

    // POST /clients
    @PostMapping("/add-procedure")
    @Transactional
    public ResponseEntity<String> createClientUsingProcedure(@Valid @RequestBody ClientCreateDTO dto) {

        Long userId = dto.getUtilisateurId();
        if (userId != null && !utilisateurRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Utilisateur not found with ID: " + userId);
        }

        clientRepository.executeAddClient(
                userId,
                dto.getNom(),
                dto.getPrenom(),
                dto.getTelephone(),
                dto.getEmail(),
                dto.getAdresse()
        );

        return new ResponseEntity<>("Client created via procedure: " + dto.getNom(), HttpStatus.CREATED);
    }

}