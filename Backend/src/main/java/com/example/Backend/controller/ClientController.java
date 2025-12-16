package com.example.Backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Backend.dto.ClientCreateDTO;
import com.example.Backend.exception.ResourceNotFoundException;
import com.example.Backend.model.Client;
import com.example.Backend.repository.ClientRepository;
import com.example.Backend.repository.UtilisateurRepository;

import jakarta.validation.Valid;

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
    /**
     * Delete a client by id (only staff)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('Admin') or hasAuthority('Manager') or hasAuthority('Réceptionniste')")
    public ResponseEntity<String> deleteClient(@PathVariable Long id) {
        if (!clientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Client not found with ID: " + id);
        }
        try {
            clientRepository.deleteById(id);
            return ResponseEntity.ok("Client deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur serveur lors de la suppression du client: " + e.getMessage());
        }
    }}