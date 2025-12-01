package com.example.Backend.repository;

import com.example.Backend.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import java.util.Date;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // Custom finder required by the Controller for self-service check
    // (Assuming Client model has a Long utilisateurId field for the FK)
    List<Reservation> findByClientId(Long clientId);

    // ==========================================================
    // 1. Core Logic: P_CREER_RESERVATION (Create Reservation)
    // ==========================================================
    /**
     * Executes the Oracle Stored Procedure P_CREER_RESERVATION.
     * This handles availability check, reservation creation, and returns status message.
     */
    @Procedure(procedureName = "P_CREER_RESERVATION", outputParameterName = "p_message")
    String executeCreerReservation(
            @Param("p_client_id") Long clientId,
            @Param("p_chambre_id") Long chambreId,
            @Param("p_date_debut") Date dateDebut,
            @Param("p_date_fin") Date dateFin
    );

    // ==========================================================
    // 2. Core Logic: F_VERIFIER_DISPONIBILITE (Check Availability)
    // ==========================================================
    /**
     * Calls the Oracle Stored Function F_VERIFIER_DISPONIBILITE.
     * Returns 1 (Available) or 0 (Not Available).
     */
    @Procedure(name = "F_VERIFIER_DISPONIBILITE")
    Integer executeVerifierDisponibilite(
            @Param("p_chambre_id") Long chambreId,
            @Param("p_date_debut") Date dateDebut,
            @Param("p_date_fin") Date dateFin
    );

    // ==========================================================
    // 3. Status Change: P_CHECK_IN
    // ==========================================================
    /**
     * Executes the Oracle Stored Procedure P_CHECK_IN.
     */
    @Procedure(procedureName = "P_CHECK_IN", outputParameterName = "p_message")
    String executeCheckIn(
            @Param("p_res_id") Long resId
    );

    // ==========================================================
    // 4. Status Change: P_CHECK_OUT
    // ==========================================================
    /**
     * Executes the Oracle Stored Procedure P_CHECK_OUT.
     */
    @Procedure(procedureName = "P_CHECK_OUT", outputParameterName = "p_message")
    String executeCheckOut(
            @Param("p_res_id") Long resId
    );

    // ==========================================================
    // 5. Status Change: P_ANNULER_RESERVATION
    // ==========================================================
    /**
     * Executes the Oracle Stored Procedure P_ANNULER_RESERVATION.
     */
    @Procedure(procedureName = "P_ANNULER_RESERVATION", outputParameterName = "p_message")
    String executeAnnulerReservation(
            @Param("p_res_id") Long resId
    );

    // ==========================================================
    // 6. Service: P_AJOUTER_SERVICE (Requires ASSOCIÉ table)
    // ==========================================================
    /**
     * Executes the Oracle Stored Procedure P_AJOUTER_SERVICE.
     */
    @Procedure(procedureName = "P_AJOUTER_SERVICE", outputParameterName = "p_message")
    String executeAjouterService(
            @Param("p_res_id") Long resId,
            @Param("p_service_id") Long serviceId
    );


}