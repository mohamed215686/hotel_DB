package com.example.Backend.repository;

import com.example.Backend.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    // Custom method to find a Role by its name (NOMROLE)
    Optional<Role> findByNomRole(String nomRole);

    @Procedure(procedureName = "ADD_ROLE")
    void executeAddRole(
            @Param("p_nomrole") String nomRole,
            @Param("p_description") String description
    );
}