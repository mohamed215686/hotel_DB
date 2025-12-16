package com.example.Backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.example.Backend.model.Client;

public interface ClientRepository extends JpaRepository<Client, Long> {

    @Procedure(procedureName = "PRC_INSCRIPTION_CLIENT", outputParameterName = "p_message")
    @Transactional
    String executeInscriptionClient(
            @Param("p_login") String login,
            @Param("p_motdepassehash") String motDePasseHash,
            @Param("p_nom") String nom,
            @Param("p_prenom") String prenom,
            @Param("p_telephone") String telephone,
            @Param("p_email") String email,
            @Param("p_adresse") String adresse
    );

    @Procedure(procedureName = "P_ADD_CLIENT", outputParameterName = "p_message")
    @Transactional
    String executeAddClient(
            @Param("p_nom") String nom,
            @Param("p_prenom") String prenom,
            @Param("p_telephone") String telephone,
            @Param("p_email") String email,
            @Param("p_adresse") String adresse
    );

    Optional<Client> findByUtilisateur_UtilisateurId(Long utilisateurId);
}