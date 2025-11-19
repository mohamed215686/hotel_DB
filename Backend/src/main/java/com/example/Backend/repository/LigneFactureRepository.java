package com.example.Backend.repository;

import com.example.Backend.model.LigneFacture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface LigneFactureRepository extends JpaRepository<LigneFacture, Long> {

    @Procedure(procedureName = "ADD_LIGNE_FACTURE")
    void executeAddLigneFacture(
            @Param("p_facture_id") Long factureId,
            @Param("p_description") String description,
            @Param("p_quantite") Integer quantite,
            @Param("p_prix_unitaire") BigDecimal prixUnitaire,
            @Param("p_sous_total") BigDecimal sousTotal
    );

    // Custom finder to support the LigneFactureController GET endpoint
    List<LigneFacture> findByFactureId(Long factureId);
}