package com.example.Backend.controller;

import com.example.Backend.dto.RoleCreateDTO; // <-- Import DTO
import com.example.Backend.model.Role;
import com.example.Backend.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController

@RequestMapping("/roles")

public class RoleController {

    @Autowired
    private RoleRepository roleRepository;

    @GetMapping
    public List<Role> getAllRoles() {
        // Standard JPA is usually preferred for simple SELECTs
        return roleRepository.findAll();
    }




}