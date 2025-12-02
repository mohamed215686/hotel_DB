package com.example.Backend.repository;

import com.example.Backend.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;


public interface ServiceRepository extends JpaRepository<Service, Long> {

    // --- 1. Procedure for AJOUTER_SERVICE (Add New Service) ---
    // Maps to: PROCEDURE ajouter_service(p_libelle_service IN VARCHAR2, p_tarif_unitaire IN NUMBER)
    @Procedure(procedureName = "ajouter_service")
    @Transactional
    void executeAjouterService(
            @Param("p_libelle_service") String libelle,
            @Param("p_tarif_unitaire") BigDecimal tarif
    );

    // --- 2. Procedure for SUPPRIMER_SERVICE (Delete Service) ---
    // Maps to: PROCEDURE supprimer_service(p_id_service IN NUMBER)
    @Procedure(procedureName = "supprimer_service")
    @Transactional
    void executeSupprimerService(@Param("p_id_service") Long idService);


    // Standard JPA method remains for checks
    boolean existsById(Long id);
}