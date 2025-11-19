package com.example.Backend.controller;

import com.example.Backend.dto.ServiceCreateDTO;
import com.example.Backend.exception.ResourceNotFoundException;
import com.example.Backend.model.Service;
import com.example.Backend.repository.ServiceRepository;
import jakarta.validation.Valid;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/services")
public class ServiceController {

    @Autowired
    private ServiceRepository serviceRepository;

    @PostMapping("/add-procedure")
    @Transactional
    public ResponseEntity<String> createServiceUsingProcedure(@Valid @RequestBody ServiceCreateDTO dto) {

        serviceRepository.executeAddService(
                dto.getLibelle(),
                dto.getTarifUnitaire()
        );

        return new ResponseEntity<>("Service created via procedure: " + dto.getLibelle(), HttpStatus.CREATED);
    }
}