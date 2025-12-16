package com.example.Backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Backend.dto.ReservationCreateDTO;
import com.example.Backend.exception.ResourceNotFoundException;
import com.example.Backend.model.Client;
import com.example.Backend.model.Reservation;
import com.example.Backend.model.Service;
import com.example.Backend.model.UtilisateurDetails;
import com.example.Backend.repository.ChambreRepository;
import com.example.Backend.repository.ClientRepository;
import com.example.Backend.repository.ReservationRepository;
import com.example.Backend.repository.ServiceRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/reservations")
public class ReservationController {

    @Autowired
    private ReservationRepository reservationRepository;
    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private ChambreRepository chambreRepository;
    @Autowired
    private ServiceRepository serviceRepository;


    // ==========================================================
    // CORE: CREATE RESERVATION (CLIENT SELF-SERVICE)
    // Endpoint: POST /reservations
    // ==========================================================
    @PostMapping("/createReservation")
    public ResponseEntity<String> createReservation(
        @Valid @RequestBody ReservationCreateDTO reservationDto,
        @AuthenticationPrincipal UtilisateurDetails currentUser) {

    System.out.println("--- DEBUG: Starting createReservation request ---");

    Long currentUserId = currentUser.getUtilisateurId();
    Long userRoleId = currentUser.getRoleId();
    System.out.println("DEBUG: Authenticated Utilisateur ID: " + currentUserId + ", Role ID: " + userRoleId);

    boolean isStaff = (userRoleId != null && (userRoleId.equals(1L) || userRoleId.equals(4L) || userRoleId.equals(3L)));
    Long clientIdToUse;

    if (isStaff) {
        // Staff may create reservations for other clients: validate the client exists
        System.out.println("DEBUG: Staff user detected—allowing reservation on behalf of client ID: " + reservationDto.getClientId());
        if (!clientRepository.existsById(reservationDto.getClientId())) {
            String errorMsg = "Client non trouvé avec ID: " + reservationDto.getClientId();
            System.err.println("ERROR: " + errorMsg);
            throw new ResourceNotFoundException(errorMsg);
        }
        clientIdToUse = reservationDto.getClientId();
    } else {
        // Non-staff: must have a client profile linked to the authenticated user and must book for themselves
        Optional<Client> clientOpt = clientRepository.findByUtilisateur_UtilisateurId(currentUserId);
        if (clientOpt.isEmpty()) {
            String errorMsg = "Client profile non trouvé pour l'utilisateur ID: " + currentUserId;
            System.err.println("ERROR: Security check failed. " + errorMsg);
            throw new ResourceNotFoundException(errorMsg);
        }
        Client client = clientOpt.get();
        System.out.println("DEBUG: Mapped Client ID: " + client.getClientId());

        if (!client.getClientId().equals(reservationDto.getClientId())) {
            String errorMsg = "Erreur: Client ID dans le token (" + client.getClientId() +
                    ") ne correspond pas au Client ID dans le DTO (" + reservationDto.getClientId() + ").";
            System.err.println("ERROR: Enforcement check failed. " + errorMsg);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorMsg);
        }
        clientIdToUse = client.getClientId();
    }

    System.out.println("DEBUG: Reservation DTO received: " + reservationDto);

    // --- 2. Input Validation ---
    if (!chambreRepository.existsById(reservationDto.getChambreId())) {
        String errorMsg = "Chambre non trouvée avec ID: " + reservationDto.getChambreId();
        System.err.println("ERROR: Input validation failed. " + errorMsg);
        throw new ResourceNotFoundException(errorMsg);
    }

    System.out.println("DEBUG: Chambre " + reservationDto.getChambreId() + " confirmed available in repository.");

    // --- 3. Execute Oracle Procedure: P_CREER_RESERVATION ---
    System.out.println("DEBUG: Calling P_CREER_RESERVATION with params:");
    System.out.println("  - Client ID: " + clientIdToUse);
    System.out.println("  - Chambre ID: " + reservationDto.getChambreId());
    System.out.println("  - Date Début: " + reservationDto.getDateDebut());
    System.out.println("  - Date Fin: " + reservationDto.getDateFin());

    String message = reservationRepository.executeCreerReservation(
            clientIdToUse,
            reservationDto.getChambreId(),
            reservationDto.getDateDebut(),
            reservationDto.getDateFin()
    );

    // 4. Handle response message from Oracle
    if (message.startsWith("Erreur:")) {
        System.err.println("ERROR: Oracle Procedure returned an error. Message: " + message);
        return ResponseEntity.badRequest().body(message);
    }

    System.out.println("DEBUG: Reservation successful. Message: " + message);
    return ResponseEntity.status(HttpStatus.CREATED).body(message);
}
    // ==========================================================
    // READ OPERATIONS (Secured by SecurityConfig: GET /reservations/**)
    // ==========================================================

    @GetMapping("/{id}")
    public ResponseEntity<Reservation> getReservationById(
            @PathVariable Long id,
            @AuthenticationPrincipal UtilisateurDetails currentUser) {

        Long currentUserId = currentUser.getUtilisateurId();
        Long userRoleId = currentUser.getRoleId();

        System.out.println("DEBUG: Attempting to fetch Reservation ID: " + id + " by User ID: " + currentUserId);

        // 1. Fetch the reservation object. If not found, throw ResourceNotFound (404).
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Réservation non trouvée avec id: " + id));

        // --- 2. SECURITY CHECK: STAFF ACCESS (Role IDs 1 and 2 can see all) ---
        // Assuming 1=Admin, 2=Receptionniste
        if (userRoleId == 1L || userRoleId == 3L || userRoleId == 4L) {
            System.out.println("DEBUG: Access granted (Staff role " + userRoleId + ").");
            return ResponseEntity.ok(reservation);
        }

        // --- 3. SECURITY CHECK: CLIENT OWNERSHIP ---

        // Find the Client profile linked to the current authenticated User ID
        Optional<Client> clientOpt = clientRepository.findByUtilisateur_UtilisateurId(currentUserId);

        if (clientOpt.isEmpty()) {
            System.err.println("ERROR: Unauthorized access. User " + currentUserId + " is neither staff nor a registered client.");
            // Non-staff user without a client profile is denied access (HTTP 403)
            throw new AccessDeniedException("You are not authorized to view this specific reservation.");
        }

        // Get the client ID of the user currently accessing the endpoint
        Long clientAccessingId = clientOpt.get().getClientId();

        // Get the client ID stored directly on the reservation object (as requested)
        Long reservationOwnerId = reservation.getClientId();

        // Check if the authenticated user's Client ID matches the reservation's Client ID
        if (!clientAccessingId.equals(reservationOwnerId)) {
            System.err.println("ERROR: Forbidden access. Client ID " + clientAccessingId + " attempted to view reservation owned by " + reservationOwnerId);
            // Client attempting to view another client's reservation is denied access (HTTP 403)
            throw new AccessDeniedException("You do not have permission to view reservations belonging to other clients.");
        }

        // Access granted: Client is viewing their own reservation
        System.out.println("DEBUG: Access granted (Client owns reservation).");
        return ResponseEntity.ok(reservation);
    }

    // Inside ReservationController.java


    @GetMapping
    public ResponseEntity<List<Reservation>> getAllReservations(
            @AuthenticationPrincipal UtilisateurDetails currentUser) {

        Long currentUserId = currentUser.getUtilisateurId();
        Long userRoleId = currentUser.getRoleId(); // Assuming this method exists

        System.out.println("DEBUG: Accessing Reservations - Role ID: " + userRoleId);

        // --- 1. ACCESS FOR HOTEL STAFF (Admin, Manager, Receptionniste) ---
        // Assuming Admin (1) and Receptionniste (2) are staff roles that see all data.
        if (userRoleId == 1L || userRoleId == 3L || userRoleId == 4L) {
            System.out.println("DEBUG: Staff user detected. Returning ALL reservations.");
            return ResponseEntity.ok(reservationRepository.findAll());
        }

        // --- 2. ACCESS FOR STANDARD CLIENTS ---
        // If not staff, the user must be a client and can only see their own bookings.

        // Find the Client profile linked to the current authenticated User ID
        Optional<Client> clientOpt = clientRepository.findByUtilisateur_UtilisateurId(currentUserId);

        if (clientOpt.isEmpty()) {
            // This handles cases where a non-staff user is logged in but has no client profile
            System.err.println("ERROR: Non-staff user " + currentUserId + " has no linked Client profile.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(List.of()); // Return empty list or throw forbidden error
        }

        Long clientId = clientOpt.get().getClientId();
        System.out.println("DEBUG: Client user detected. Returning reservations for Client ID: " + clientId);

        // Fetch reservations linked ONLY to that Client ID
        List<Reservation> clientReservations = reservationRepository.findByClientId(clientId);

        return ResponseEntity.ok(clientReservations);
    }

    // ==========================================================
    // STAFF OPERATION: STATUS CHANGES
    // ==========================================================

    @PostMapping("/{id}/checkin")
// @PreAuthorize("hasAuthority('Admin') or hasAuthority('Réceptionniste') or hasAuthority('Manager')") // REMOVED
    public ResponseEntity<String> checkIn(
            @PathVariable Long id,
            @AuthenticationPrincipal UtilisateurDetails currentUser) { // Inject currentUser

        Long userRoleId = currentUser.getRoleId();

        // Check if the user is authorized staff (Role 1 or Role 3)
        if (userRoleId != 1L && userRoleId != 3L || userRoleId == 4L) {
            System.err.println("FORBIDDEN: User ID " + currentUser.getUtilisateurId() + " (Role ID: " + userRoleId + ") attempted Check-In/Out operation.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Only authorized staff can perform this operation.");
        }

        // Logging or debugging prints can stay here
        String message = reservationRepository.executeCheckIn(id);
        if (message.startsWith("Erreur:")) {
            return ResponseEntity.badRequest().body(message);
        }
        return ResponseEntity.ok(message);
    }

    // ==========================================================
    // STAFF OPERATION: CHECK-OUT
    // Access limited to Admin (Role 1) and Receptionniste (Role 2)
    // ==========================================================
    @PostMapping("/{id}/checkout")
// @PreAuthorize("hasAuthority('Admin') or hasAuthority('Réceptionniste') or hasAuthority('Manager')") // REMOVED
    public ResponseEntity<String> checkOut(
            @PathVariable Long id,
            @AuthenticationPrincipal UtilisateurDetails currentUser) { // Inject currentUser

        Long userRoleId = currentUser.getRoleId();

        // Check if the user is authorized staff (Role 1 or Role 3)
        if (userRoleId != 1L && userRoleId != 3L || userRoleId == 4L) {
            System.err.println("FORBIDDEN: User ID " + currentUser.getUtilisateurId() + " (Role ID: " + userRoleId + ") attempted Check-In/Out operation.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Only authorized staff can perform this operation.");
        }

        // Logging or debugging prints can stay here
        String message = reservationRepository.executeCheckOut(id);
        if (message.startsWith("Erreur:")) {
            return ResponseEntity.badRequest().body(message);
        }
        return ResponseEntity.ok(message);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<String> cancelReservation(
            @PathVariable Long id,
            @AuthenticationPrincipal UtilisateurDetails currentUser) {

        Long currentUserId = currentUser.getUtilisateurId();
        Long userRoleId = currentUser.getRoleId();

        // 1. Check for Staff Access (Admin or Manager/Receptionniste)
        // If user is Staff (Role 1 or 3), they have full cancellation permission.
        if (userRoleId == 1L || userRoleId == 3L || userRoleId == 4L) {
            System.out.println("DEBUG: Staff user (ID: " + currentUserId + ") canceling reservation ID: " + id);
            // Skip further checks and proceed to cancellation
        } else {
            // 2. Check for Client Access (Must be the owner of the reservation)

            // A. Find the Client profile linked to the current authenticated User ID
            Optional<Client> clientOpt = clientRepository.findByUtilisateur_UtilisateurId(currentUserId);

            if (clientOpt.isEmpty()) {
                // User is not staff AND has no client profile
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Erreur: Vous n'avez pas l'autorisation d'annuler des réservations.");
            }

            Long currentClientId = clientOpt.get().getClientId();

            // B. Find the reservation to get the linked Client ID
            Optional<Reservation> reservationOpt = reservationRepository.findById(id);

            if (reservationOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Erreur: Réservation non trouvée.");
            }

            Long reservationOwnerClientId = reservationOpt.get().getClientId();

            // C. Compare the current client ID with the reservation's owner ID
            if (!currentClientId.equals(reservationOwnerClientId)) {
                System.err.println("FORBIDDEN: Client ID " + currentClientId + " attempted to cancel reservation ID " + id + " owned by client " + reservationOwnerClientId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Erreur: Vous ne pouvez annuler que vos propres réservations.");
            }
            System.out.println("DEBUG: Client user (ID: " + currentClientId + ") canceling their own reservation ID: " + id);
        }

        // --- EXECUTE CANCELLATION (Reached only if Staff OR Reservation Owner) ---
        String message = reservationRepository.executeAnnulerReservation(id);

        if (message.startsWith("Erreur:")) {
            return ResponseEntity.badRequest().body(message);
        }

        return ResponseEntity.ok(message);
    }

    // ==========================================================
    // STAFF OPERATION: ADD SERVICE (ASSOCIÉ)
    // ==========================================================
    @PostMapping("/{resId}/add-service/{serviceId}")
    public ResponseEntity<String> addServiceToReservation(
            @PathVariable Long resId,
            @PathVariable Long serviceId,
            @AuthenticationPrincipal UtilisateurDetails currentUser) { // Inject currentUser

        Long currentUserId = currentUser.getUtilisateurId();
        Long userRoleId = currentUser.getRoleId();

        // 0. Preliminary Check: Service Existence
        if (!serviceRepository.existsById(serviceId)) {
            throw new ResourceNotFoundException("Service non trouvé avec ID: " + serviceId);
        }

        // --- 1. AUTHORIZATION CHECK ---

        // Find the reservation first to determine the owner
        Optional<Reservation> reservationOpt = reservationRepository.findById(resId);

        if (reservationOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Erreur: Réservation non trouvée.");
        }
        Reservation reservation = reservationOpt.get();
        Long reservationOwnerClientId = reservation.getClientId();

        // A. Check for Staff Access (Admin or Manager/Receptionniste)
        // Staff roles are assumed to be 1L or 3L based on previous code.
        if (userRoleId == 1L || userRoleId == 3L || userRoleId == 4L) {
            System.out.println("DEBUG: Staff user (ID: " + currentUserId + ") adding service to reservation ID: " + resId);
            // Staff is authorized, skip client checks.
        } else {
            // B. Check for Client Access (Must be the owner of the reservation)

            // Find the Client profile linked to the current authenticated User ID
            Optional<Client> clientOpt = clientRepository.findByUtilisateur_UtilisateurId(currentUserId);

            if (clientOpt.isEmpty()) {
                // User is not staff AND has no client profile
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Erreur: Vous n'avez pas l'autorisation d'ajouter des services à cette réservation.");
            }

            Long currentClientId = clientOpt.get().getClientId();

            // C. Compare the current client ID with the reservation's owner ID
            if (!currentClientId.equals(reservationOwnerClientId)) {
                System.err.println("FORBIDDEN: Client ID " + currentClientId + " attempted to modify reservation ID " + resId + " owned by client " + reservationOwnerClientId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Erreur: Vous ne pouvez ajouter des services qu'à vos propres réservations.");
            }
            System.out.println("DEBUG: Client user (ID: " + currentClientId + ") adding service to their own reservation ID: " + resId);
        }

        // --- 2. EXECUTE SERVICE ADDITION (Reached only if Staff OR Reservation Owner) ---
        String message = reservationRepository.executeAjouterService(resId, serviceId);

        if (message.startsWith("Info: Ce service est déjà inclus.")) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(message);
        }
        if (message.startsWith("Erreur:")) {
            return ResponseEntity.badRequest().body(message);
        }
        return ResponseEntity.ok(message);
    }

    @GetMapping("/{resId}/services")
    @Transactional(readOnly = true) // Fix: Add @Transactional to keep session open for LAZY loading
    public ResponseEntity<?> getReservationServices(
            @PathVariable Long resId,
            @AuthenticationPrincipal UtilisateurDetails currentUser) {

        Long currentUserId = currentUser.getUtilisateurId();
        Long userRoleId = currentUser.getRoleId();

        // 1. Find the Reservation and its Owner
        Optional<Reservation> reservationOpt = reservationRepository.findById(resId);

        if (reservationOpt.isEmpty()) {
            // Use your ResourceNotFoundException if you have a global handler for it
            // throw new ResourceNotFoundException("Réservation non trouvée avec ID: " + resId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Erreur: Réservation non trouvée.");
        }

        Reservation reservation = reservationOpt.get();
        Long reservationOwnerClientId = reservation.getClientId();

        // --- 2. AUTHORIZATION LOGIC (Identical to previous solution) ---

        boolean isAuthorized = false;

        // A. Staff Check (Role 1: Admin, Role 3: Manager/Receptionniste)
        if (userRoleId != null && (userRoleId.equals(1L) || userRoleId.equals(3L) || userRoleId.equals(4L))) {
            System.out.println("DEBUG: Staff user (ID: " + currentUserId + ") viewing services for reservation ID: " + resId);
            isAuthorized = true;
        }

        // B. Client Owner Check
        if (!isAuthorized) {
            Optional<Client> clientOpt = clientRepository.findByUtilisateur_UtilisateurId(currentUserId);

            if (clientOpt.isPresent()) {
                Long currentClientId = clientOpt.get().getClientId();

                if (currentClientId.equals(reservationOwnerClientId)) {
                    System.out.println("DEBUG: Client user (ID: " + currentClientId + ") viewing services for their own reservation ID: " + resId);
                    isAuthorized = true;
                }
            }
        }

        // C. Deny Access if Not Authorized
        if (!isAuthorized) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Erreur: Vous n'avez pas l'autorisation de voir les services de cette réservation.");
        }

        // --- 3. EXECUTE DATA RETRIEVAL (The fix is here) ---
        // If authorization passed, fetch the services directly from the loaded entity.
        // With @Transactional, the Hibernate session remains open, so LAZY loading will work.
        List<Service> associatedServices = reservation.getServices(); // ASSUMES a getServices() method exists on Reservation

        // Handle null case (no services added yet)
        if (associatedServices == null) {
            associatedServices = new java.util.ArrayList<>();
        }

        return ResponseEntity.ok(associatedServices);
    }
}