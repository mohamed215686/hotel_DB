package com.example.Backend.repository;

import com.example.Backend.model.Facture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

import java.util.Date;

public interface FactureRepository extends JpaRepository<Facture, Long> {

    @Procedure(procedureName = "ADD_FACTURE")
    void executeAddFacture(
            @Param("p_statut_paiement") String statutPaiement,
            @Param("p_date_paiement") Date datePaiement,
            @Param("p_date_emission") Date dateEmission
    );
}