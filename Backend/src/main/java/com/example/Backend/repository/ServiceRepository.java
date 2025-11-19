package com.example.Backend.repository;

import com.example.Backend.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;


public interface ServiceRepository extends JpaRepository<Service, Long> {

    @Procedure(procedureName = "ADD_SERVICE")
    void executeAddService(
            @Param("p_libelle") String libelle,
            @Param("p_tarif_unitaire") BigDecimal tarifUnitaire
    );
}