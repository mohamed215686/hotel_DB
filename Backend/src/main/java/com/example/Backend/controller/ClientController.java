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
import org.springframework.security.access.prepost.PreAuthorize;
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

    @PostMapping("/walkin")
    @PreAuthorize("hasAuthority('Admin') or hasAuthority('Manager') or hasAuthority('Réceptionniste')")
    public ResponseEntity<String> addClient(@Valid @RequestBody ClientCreateDTO dto) {

        try {
            String message = clientRepository.executeAddClient(
                    dto.getNom(),
                    dto.getPrenom(),
                    dto.getTelephone(),
                    dto.getEmail(),
                    dto.getAdresse()
            );

            if (message.startsWith("Erreur:")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(message);
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(message);

        } catch (Exception e) {
            // Handle unexpected SQL errors
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur serveur: " + e.getMessage());
        }

}
}