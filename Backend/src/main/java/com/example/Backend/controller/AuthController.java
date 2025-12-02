package com.example.Backend.controller;

import com.example.Backend.dto.*;

import com.example.Backend.model.Utilisateur;
import com.example.Backend.model.UtilisateurDetails;
import com.example.Backend.repository.ClientRepository;
import com.example.Backend.repository.UtilisateurRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private ClientRepository clientRepository;

    // Declare the final field
    private final AuthenticationManager authenticationManager;

    // Use constructor injection to resolve the dependency
    public AuthController(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    // Simple helper to process the procedure's output message
    private ResponseEntity<String> handleSignupMessage(String message) {
        if (message.startsWith("Erreur:")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(message);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    @PostMapping("/signup")
    public ResponseEntity<String> registerClient(@Valid @RequestBody ClientSignupDTO dto) {

        // 1. Hashing (In a real app, hash the password here using BCrypt)
        // String hashedPassword = passwordEncoder.encode(dto.getMotDePasse());
        // For this example, we'll use a placeholder based on the login:


        try {
            // 2. Call the PL/SQL procedure
            String message = clientRepository.executeInscriptionClient(
                    dto.getLogin(),
                    dto.getMotDePasse(), // Use the hash or placeholder
                    dto.getNom(),
                    dto.getPrenom(),
                    dto.getTelephone(),
                    dto.getEmail(),
                    dto.getAdresse()
            );

            // 3. Return the processed result
            return handleSignupMessage(message);

        } catch (Exception e) {
            // Catch database connection or unexpected persistence errors
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur serveur lors de l'inscription: " + e.getMessage());
        }
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO request) {
        try {
            // 1. Create an authentication object with the submitted credentials
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getLogin(), request.getMotDePasse())
            );

            // 2. If authentication is successful, set the security context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // 3. Get the fully loaded principal (UtilisateurDetails)
            UtilisateurDetails currentUser = (UtilisateurDetails) authentication.getPrincipal();

            // 4. Build the success response DTO
            String roleName = currentUser.getAuthorities().iterator().next().getAuthority();

            LoginResponseDTO response = new LoginResponseDTO(
                    currentUser.getUtilisateurId(),
                    currentUser.getRoleId(),
                    currentUser.getUsername(),
                    roleName
            );

            return ResponseEntity.ok(response);

        } catch (Exception ex) {
            // Handle exceptions thrown by authenticationManager (e.g., BadCredentialsException)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Échec de l'authentification: Login ou mot de passe invalide.");
        }
    }

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    // ... other injected fields and methods ...

    /**
     * Retrieves the current authenticated user's profile details.
     * Path: GET /auth/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<LoginResponseDTO> getProfile(@AuthenticationPrincipal UtilisateurDetails currentUser) {

        // This is essentially the same logic as the successful login response
        String roleName = currentUser.getAuthorities().iterator().next().getAuthority();

        LoginResponseDTO response = new LoginResponseDTO(
                currentUser.getUtilisateurId(),
                currentUser.getRoleId(),
                currentUser.getUsername(),
                roleName
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Changes the current authenticated user's password using a stored procedure.
     * Path: POST /auth/profile/changepassword
     */
    @PostMapping("/profile/changepassword")
    public ResponseEntity<String> changePassword(
            @AuthenticationPrincipal UtilisateurDetails currentUser,
            @Valid @RequestBody ChangePasswordDTO dto) {

        Long userId = currentUser.getUtilisateurId();

        // 1. (Ideal) Hash the new password before sending it to the procedure
        // String hashedPassword = passwordEncoder.encode(dto.getNewPassword());
        // For now, we use the raw string, assuming the stored procedure handles the raw value:
        String newPasswordValue = dto.getNewPassword(); // WARNING: Unhashed!

        try {
            // 2. Call the stored procedure to update the password in the UTILISATEUR table
            String message = utilisateurRepository.executeChangePassword(userId, newPasswordValue);

            if (message.startsWith("Erreur:")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(message);
            }

            // NOTE: After a successful password change, you should generally log the user out
            // for security purposes, or force a token refresh.

            return ResponseEntity.ok(message);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur serveur lors du changement de mot de passe: " + e.getMessage());
        }
    }

    /**
     * Changes the current authenticated user's username (login).
     * Path: POST /auth/profile/changeusername
     * NOTE: This requires a custom PL/SQL procedure or manual JPA save, as only a password procedure was provided.
     */
    @PostMapping("/profile/changeusername")
    public ResponseEntity<String> changeUsername(
            @AuthenticationPrincipal UtilisateurDetails currentUser,
            @Valid @RequestBody ChangeUsernameDTO dto) {

        // 1. Find the user entity (assuming login is part of the entity)
        Utilisateur utilisateur = utilisateurRepository.findById(currentUser.getUtilisateurId())
                .orElseThrow(() -> new RuntimeException("User not found in session."));

        // 2. Perform uniqueness check (crucial!)
        if (utilisateurRepository.findByLoginIgnoreCase(dto.getNewUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Erreur: Ce nom d'utilisateur est déjà pris.");
        }

        // 3. Update the login field
        utilisateur.setLogin(dto.getNewUsername());

        // 4. Save the entity
        // NOTE: This operation typically requires @Transactional on a service method.
        utilisateurRepository.save(utilisateur);

        // 5. Update security context (optional, but necessary for immediate reflection)
        // Since the username changed, the current session user details are stale.

        return ResponseEntity.ok("Succès: Nom d'utilisateur mis à jour. Veuillez vous reconnecter.");
    }
}