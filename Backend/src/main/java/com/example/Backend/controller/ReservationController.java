package com.example.Backend.controller;

import com.example.Backend.dto.ReservationCreateDTO;
import com.example.Backend.exception.ResourceNotFoundException;
import com.example.Backend.model.Reservation;
// 🚩 CHANGE 1: Remove imports for Client and Chambre models/repositories
// import com.example.Backend.model.Client;
// import com.example.Backend.model.Chambre;
// import com.example.Backend.repository.ClientRepository;
// import com.example.Backend.repository.ChambreRepository;

import com.example.Backend.repository.ReservationRepository;
// 🚩 NEW IMPORTS FOR VALIDATION (if needed later):
import com.example.Backend.repository.ClientRepository;
import com.example.Backend.repository.ChambreRepository;


import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/reservations")
public class ReservationController {

    @Autowired
    private ReservationRepository reservationRepository;

    // 🚩 CHANGE 2: Keep repositories ONLY for validation check (Best Practice)
    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private ChambreRepository chambreRepository;

    @PostMapping("/add-procedure")
    @Transactional
    public ResponseEntity<String> createReservationUsingProcedure(@Valid @RequestBody ReservationCreateDTO dto) {

        if (!clientRepository.existsById(dto.getClientId())) {
            throw new ResourceNotFoundException("Client not found with ID: " + dto.getClientId());
        }
        if (!chambreRepository.existsById(dto.getChambreId())) {
            throw new ResourceNotFoundException("Chambre not found with ID: " + dto.getChambreId());
        }

        reservationRepository.executeAddReservation(
                dto.getClientId(),
                dto.getChambreId(),
                dto.getDateDebut(),
                dto.getDateFin(),
                dto.getStatut()
        );

        return new ResponseEntity<>("Reservation created via procedure for client ID: " + dto.getClientId(), HttpStatus.CREATED);
    }
}