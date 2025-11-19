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

    @PostMapping("/add_role")
    public ResponseEntity<String> createRoleUsingProcedure( @RequestBody RoleCreateDTO roleDto) {

        // Call the repository method, which triggers the Oracle procedure
        roleRepository.executeAddRole(
                roleDto.getNomRole(),
                roleDto.getDescription()
        );

        // Since the procedure handles the INSERT and ID generation,
        // we return a success status (201 Created) without the new ID.
        return new ResponseEntity<>("Role created via Oracle procedure: " + roleDto.getNomRole(), HttpStatus.CREATED);
    }


}