package com.example.Backend.repository;

import com.example.Backend.model.Facture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Date;

public interface FactureRepository extends JpaRepository<Facture, Long> {

    @Procedure(procedureName = "P_GENERATE_FACTURE", outputParameterName = "p_message")
    @Transactional
    String executeGenerateFacture(@Param("p_res_id") Long resId);

    // --- 2. Procedure for P_MARK_FACTURE_PAID (Replaces PRC_ENREGISTRER_PAIEMENT usage) ---
    // Maps the OUT VARCHAR2 p_message to the method's String return type.
    @Procedure(procedureName = "P_MARK_FACTURE_PAID", outputParameterName = "p_message")
    @Transactional
    String executeMarkFacturePaid(@Param("p_facture_id") Long factureId);

    // --- 2. Procedure for PRC_AJOUTER_LIGNE_FACTURE ---
    // This procedure does not have an explicit String OUT parameter, so it returns void.
    // Errors are handled by catching exceptions (like DataIntegrityViolationException).


    // --- 3. Procedure for PRC_ENREGISTRER_PAIEMENT ---
    // This updates the status and date of payment.




    // Custom finder (useful for security checks)
    Facture findByResId(Long resId);
}