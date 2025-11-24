package com.example.Backend.config;

// ... other imports ...
import com.example.Backend.service.JpaUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.password.NoOpPasswordEncoder; // <-- Import the necessary class
import org.springframework.security.web.SecurityFilterChain;
// ... other imports

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JpaUserDetailsService userDetailsService;

    public SecurityConfig(JpaUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> {

                    //roles
                    auth.requestMatchers(HttpMethod.POST, "/roles").hasAuthority("ADMIN");
                    auth.requestMatchers(HttpMethod.GET, "/roles").hasAuthority("ADMIN");
                    auth.requestMatchers(HttpMethod.GET, "/roles/**").hasAuthority("ADMIN");
                    auth.requestMatchers(HttpMethod.POST, "/roles/add_role").hasAuthority("ADMIN");
                    auth.requestMatchers(HttpMethod.PUT, "/roles/**").hasAuthority("ADMIN");
                    auth.requestMatchers(HttpMethod.DELETE, "/roles/**").hasAuthority("ADMIN");

                    //utilisateur

                    auth.anyRequest().authenticated();
                })
                .httpBasic(Customizer.withDefaults())
                .formLogin(frm -> frm.disable());

        return http.build();
    }


    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setPasswordEncoder(NoOpPasswordEncoder.getInstance());
        provider.setUserDetailsService(userDetailsService);
        return provider;
    }
}