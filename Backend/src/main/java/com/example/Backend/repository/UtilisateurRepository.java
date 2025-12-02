package com.example.Backend.repository;

import com.example.Backend.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    // You can add custom finders here if needed, e.g.,
    @Procedure(procedureName = "PRC_ADD_UTILISATEUR", outputParameterName = "p_message")
    @Transactional
    String executeAddUtilisateur(
            @Param("p_role_id") Long roleId,
            @Param("p_login") String login,
            @Param("p_motdepassehash") String motDePasseHash
    );

    @Procedure(procedureName = "P_CHANGE_PASSWORD", outputParameterName = "p_message")
    @Transactional
    String executeChangePassword(
            @Param("p_user_id") Long userId,
            @Param("p_new_pass") String newPass
    );

    Optional<Utilisateur> findByLoginIgnoreCase(String login);
}