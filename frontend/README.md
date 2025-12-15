# Hotel Management System - Frontend

A modern React + TypeScript frontend for the Hotel Management System backend.

## Features

- 🔐 Authentication (Login/Signup)
- 🛏️ Room Management
- 📅 Reservation Management
- 🛎️ Service Management
- 💰 Invoice Management
- 👥 Client Management
- 👤 User Profile Management

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Configuration

Make sure your backend is running on `http://localhost:8080`. The API service is configured to connect to this endpoint.

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── context/        # React context (Auth)
│   ├── pages/          # Page components
│   ├── services/       # API service layer
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── public/             # Static assets
└── package.json        # Dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Authentication

The frontend uses HTTP Basic Authentication. Credentials are stored in localStorage after login and automatically included in API requests.

## Role-Based Access

- **ADMIN**: Full access to all features
- **MANAGER**: Access to rooms, services, invoices, clients
- **Réceptionniste**: Access to reservations, invoices, clients
- **CLIENT**: Access to own reservations and profile

## Notes

- The backend must be running on `http://localhost:8080`
- **Important**: If you encounter CORS errors, you may need to add CORS configuration to your Spring Boot backend. Add this to your `SecurityConfig.java`:
  ```java
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
  ```
  And add `.cors(cors -> cors.configurationSource(corsConfigurationSource()))` to your `SecurityFilterChain`.
- The frontend uses Basic Auth, so credentials are sent with each request
- Date formats: The frontend sends dates in ISO format, which Spring Boot should automatically parse

