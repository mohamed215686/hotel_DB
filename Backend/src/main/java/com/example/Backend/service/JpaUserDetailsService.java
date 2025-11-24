package com.example.Backend.service;

import com.example.Backend.model.Utilisateur;
import com.example.Backend.model.UtilisateurDetails;
import com.example.Backend.repository.UtilisateurRepository;
import com.example.Backend.repository.RoleRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class JpaUserDetailsService implements UserDetailsService {

    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;

    public JpaUserDetailsService(UtilisateurRepository utilisateurRepository, RoleRepository roleRepository) {
        this.utilisateurRepository = utilisateurRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {

        System.out.println("--- JpaUserDetailsService: Attempting to load user: " + login + " ---");

        Utilisateur utilisateur = utilisateurRepository.findByLoginIgnoreCase(login) // NEW
                .orElseThrow(() -> {
                    System.out.println("--- JpaUserDetailsService: ERROR: User not found in database: " + login + " ---");
                    return new UsernameNotFoundException("Utilisateur not found with login: " + login);
                });

        System.out.println("--- JpaUserDetailsService: User found. DB ID: " + utilisateur.getUtilisateurId() + ", Role ID: " + utilisateur.getRoleId() + " ---");


        String roleName = roleRepository.findById(utilisateur.getRoleId())
                .map(r -> r.getNomRole())
                .orElse("GUEST");

        System.out.println("--- JpaUserDetailsService: User granted authority: " + roleName + " ---");

        return new UtilisateurDetails(utilisateur, roleName);
    }
}