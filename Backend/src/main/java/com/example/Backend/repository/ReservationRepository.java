package com.example.Backend.repository;

import com.example.Backend.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

import java.util.Date;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Procedure(procedureName = "ADD_RESERVATION")
    void executeAddReservation(
            @Param("p_client_id") Long clientId,
            @Param("p_chambre_id") Long chambreId,
            @Param("p_date_debut") Date dateDebut,
            @Param("p_date_fin") Date dateFin,
            @Param("p_statut") String statut
    );
}