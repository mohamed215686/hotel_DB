package com.example.Backend.repository;

import com.example.Backend.model.Chambre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface ChambreRepository extends JpaRepository<Chambre, Long> {

    @Procedure(procedureName = "ADD_CHAMBRE")
    void executeAddChambre(
            @Param("p_numero") String numero,
            @Param("p_type") String type,
            @Param("p_prix_nuitee") BigDecimal prixNuitee,
            @Param("p_statut") String statut
    );
}