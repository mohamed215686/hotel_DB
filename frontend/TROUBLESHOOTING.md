# Troubleshooting Login Issues

## Common Issues and Solutions

### 1. CORS Errors

If you see errors like "CORS policy" or "No 'Access-Control-Allow-Origin' header", you need to enable CORS in your Spring Boot backend.

**Solution:** Add this to your `SecurityConfig.java`:

```java
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

// Add this method to SecurityConfig class
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}

// Then modify your securityFilterChain method to include:
.httpBasic(Customizer.withDefaults())
.cors(cors -> cors.configurationSource(corsConfigurationSource()))
.formLogin(frm -> frm.disable());
```

### 2. Backend Not Running

Make sure your Spring Boot backend is running on `http://localhost:8080`.

**Check:** Open `http://localhost:8080/auth/login` in your browser or use:
```bash
curl -X POST http://localhost:8080/auth/login -H "Content-Type: application/json" -d '{"login":"test","motDePasse":"test"}'
```

### 3. Network Connection Issues

Check the browser console (F12) for:
- Network errors
- 404 errors (backend not found)
- 500 errors (backend error)
- CORS errors

### 4. Invalid Credentials

Make sure you're using valid credentials that exist in your database.

### 5. Check Browser Console

Open Developer Tools (F12) and check:
- **Console tab**: For JavaScript errors
- **Network tab**: For failed requests and their responses

### 6. Test the API Directly

You can test the login endpoint directly using curl:

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"your_username","motDePasse":"your_password"}'
```

If this works, the issue is in the frontend. If it doesn't, the issue is in the backend.

### 7. Check Backend Logs

Check your Spring Boot console for:
- Authentication errors
- Database connection errors
- Any exceptions

### 8. Verify Database Connection

Make sure your Oracle database is running and the connection settings in `application.properties` are correct.


