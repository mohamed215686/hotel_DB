package com.example.Backend.config;

// ... other imports ...
import com.example.Backend.model.UtilisateurDetails;
import com.example.Backend.service.JpaUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.password.NoOpPasswordEncoder; // Assuming temporary use for plaintext
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JpaUserDetailsService userDetailsService;

    public SecurityConfig(JpaUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disable CSRF for REST APIs
                .authorizeHttpRequests(auth -> {

                    // =================================================================
                    // 1. SYSTEM ADMINISTRATION (Roles & Users) - Restricted to ADMIN
                    // =================================================================
                    // Deny all Write access (POST, PUT, DELETE) on Roles/Users unless ADMIN
                    auth.requestMatchers(HttpMethod.POST, "/roles/**").hasAuthority("ADMIN");
                    auth.requestMatchers(HttpMethod.PUT, "/roles/**").hasAuthority("ADMIN");
                    auth.requestMatchers(HttpMethod.DELETE, "/roles/**").hasAuthority("ADMIN");

                    auth.requestMatchers(HttpMethod.POST, "/utilisateurs/**").hasAuthority("ADMIN");
                    auth.requestMatchers(HttpMethod.PUT, "/utilisateurs/**").hasAuthority("ADMIN");
                    auth.requestMatchers(HttpMethod.DELETE, "/utilisateurs/**").hasAuthority("ADMIN");

                    // Deny all GET access for Roles/Users unless ADMIN
                    auth.requestMatchers(HttpMethod.GET, "/roles/**").hasAuthority("ADMIN");
                    auth.requestMatchers(HttpMethod.GET, "/utilisateurs/**").hasAuthority("ADMIN");


                    // =================================================================
                    // 2. INVENTORY & SERVICES (Chambre, Service) - Staff Access
                    // =================================================================
                    // Write access requires MANAGER or ADMIN
                    auth.requestMatchers(HttpMethod.POST, "/chambres/**").hasAnyAuthority("ADMIN", "Manager");
                    auth.requestMatchers(HttpMethod.PUT, "/chambres/**").hasAnyAuthority("ADMIN", "Manager");
                    auth.requestMatchers(HttpMethod.DELETE, "/chambres/**").hasAnyAuthority("ADMIN", "Manager");

                    auth.requestMatchers(HttpMethod.POST, "/services/**").hasAnyAuthority("ADMIN", "Manager");
                    auth.requestMatchers(HttpMethod.PUT, "/services/**").hasAnyAuthority("ADMIN", "Manager");
                    auth.requestMatchers(HttpMethod.DELETE, "/services/**").hasAnyAuthority("ADMIN", "Manager");

                    // Read access (GET) is granted to any authenticated user
                    auth.requestMatchers(HttpMethod.GET, "/chambres/**").authenticated();
                    auth.requestMatchers(HttpMethod.GET, "/services/**").authenticated();


                    // =================================================================
                    // 3. BILLING & FINANCIAL (Facture, LigneFacture) - Staff Access
                    // =================================================================
                    // Read and Write access requires MANAGER or ADMIN
                    auth.requestMatchers("/factures/**").hasAnyAuthority("ADMIN", "Manager");
                    auth.requestMatchers("/lignes-facture/**").hasAnyAuthority("ADMIN", "Manager");


                    // =================================================================
                    // 4. CLIENTS & RESERVATIONS - General Authenticated Access
                    // =================================================================
                    // Client data and Reservations are read/write for staff, but also open to clients for self-service
                    // The 'anyRequest().authenticated()' will cover the basic GET/POST/PUT/DELETE for authenticated users,
                    // but you might want to add business logic later to ensure CLIENTS only modify their own IDs.

                    auth.requestMatchers(HttpMethod.GET, "/clients/**").authenticated();
                    auth.requestMatchers(HttpMethod.GET, "/reservations/**").authenticated();

                    // 🚩 FIX 1: Allow any authenticated user to create a client or reservation
                    auth.requestMatchers(HttpMethod.POST, "/clients").authenticated();
                    auth.requestMatchers(HttpMethod.POST, "/reservations").authenticated(); // <-- CLIENT CAN POST!

                    // Rule 4.3: High-Privilege Write Access (Still restricted to staff)
                    auth.requestMatchers(HttpMethod.PUT, "/clients/**").hasAnyAuthority("ADMIN", "Manager");
                    auth.requestMatchers(HttpMethod.DELETE, "/clients/**").hasAnyAuthority("ADMIN", "Manager");
                    auth.requestMatchers(HttpMethod.PUT, "/reservations/**").hasAnyAuthority("ADMIN", "Manager");
                    auth.requestMatchers(HttpMethod.DELETE, "/reservations/**").hasAnyAuthority("ADMIN", "Manager");// =================================================================
                    // 5. CATCH-ALL DEFAULT
                    // =================================================================
                    // All other requests (mostly GETs on less restricted resources) MUST be authenticated.
                    auth.anyRequest().authenticated();
                })
                .csrf(csrf -> csrf.disable()) // Disable CSRF for REST APIs
                .httpBasic(Customizer.withDefaults())
                .formLogin(frm -> frm.disable());

        return http.build();
    }


    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        // Uses NoOpPasswordEncoder with the {noop} prefix for temporary plaintext passwords
        provider.setPasswordEncoder(NoOpPasswordEncoder.getInstance());
        provider.setUserDetailsService(userDetailsService);
        return provider;
    }

    public boolean isStaff(UtilisateurDetails currentUser) {
        if (currentUser == null) {
            return false;
        }
        Long userRoleId = currentUser.getRoleId();
        // Staff roles are 1L (Admin) and 3L (Manager/Receptionist - based on your example)
        return userRoleId != null && (userRoleId.equals(1L) || userRoleId.equals(3L));
    }
}