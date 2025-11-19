package com.example.Backend.repository;

import com.example.Backend.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    // You can add custom finders here if needed, e.g.,
    Optional<Utilisateur> findByLogin(String login);
    @Procedure(procedureName = "ADD_UTILISATEUR")
    void executeAddUtilisateur(
            @Param("p_role_id") Long roleId,
            @Param("p_login") String login,
            @Param("p_motdepassehash") String motDePasseHash,
            @Param("p_actif") String actif
    );
}