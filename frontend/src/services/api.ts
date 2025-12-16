import axios, { AxiosInstance } from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  ClientSignup,
  Chambre,
  ChambreCreate,
  Client,
  ClientCreate,
  Reservation,
  ReservationCreate,
  Service,
  ServiceCreate,
  Facture,
  ChangePassword,
  ChangeUsername,
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL = 'http://localhost:8080';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include Basic Auth
    this.api.interceptors.request.use(
      (config) => {
        const auth = localStorage.getItem('auth');
        if (auth) {
          const { login, motDePasse } = JSON.parse(auth);
          const credentials = btoa(`${login}:${motDePasse}`);
          config.headers.Authorization = `Basic ${credentials}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Login endpoint doesn't require Basic Auth, so we make a direct request
    // without the interceptor adding Basic Auth headers
    const response = await axios.post<LoginResponse>(
      `${this.baseURL}/auth/login`,
      credentials,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    // Store credentials for Basic Auth on subsequent requests
    localStorage.setItem('auth', JSON.stringify(credentials));
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  }

  async signup(data: ClientSignup): Promise<string> {
    // Signup endpoint doesn't require Basic Auth
    const response = await axios.post<string>(
      `${this.baseURL}/auth/signup`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  async getProfile(): Promise<LoginResponse> {
    const response = await this.api.get<LoginResponse>('/auth/profile');
    return response.data;
  }

  async changePassword(data: ChangePassword): Promise<string> {
    const response = await this.api.post<string>('/auth/profile/changepassword', data);
    return response.data;
  }

  async changeUsername(data: ChangeUsername): Promise<string> {
    const response = await this.api.post<string>('/auth/profile/changeusername', data);
    return response.data;
  }

  // Chambres endpoints
  async getChambres(): Promise<Chambre[]> {
    const response = await this.api.get<Chambre[]>('/chambres');
    return response.data;
  }

  async getChambreById(id: number): Promise<Chambre> {
    const response = await this.api.get<Chambre>(`/chambres/${id}`);
    return response.data;
  }

  async createChambre(data: ChambreCreate): Promise<Chambre> {
    const response = await this.api.post<Chambre>('/chambres', data);
    return response.data;
  }

  async updateChambre(id: number, data: ChambreCreate): Promise<Chambre> {
    const response = await this.api.put<Chambre>(`/chambres/${id}`, data);
    return response.data;
  }

  async deleteChambre(id: number): Promise<void> {
    await this.api.delete(`/chambres/${id}`);
  }

  // Clients endpoints
  async getClients(): Promise<Client[]> {
    const response = await this.api.get<Client[]>('/clients');
    return response.data;
  }

  async getClientById(id: number): Promise<Client> {
    const response = await this.api.get<Client>(`/clients/${id}`);
    return response.data;
  }

  async createClient(data: ClientCreate): Promise<string> {
    const response = await this.api.post<string>('/clients/walkin', data);
    return response.data;
  }

  async deleteClient(id: number): Promise<string> {
    const response = await this.api.delete<string>(`/clients/${id}`);
    return response.data;
  }

  // Reservations endpoints
  async getReservations(): Promise<Reservation[]> {
    const response = await this.api.get<any[]>('/reservations');
    // Map backend field names (resId) to frontend field names (reservationId)
    return response.data.map((res: any) => ({
      ...res,
      reservationId: res.resId || res.reservationId,
    }));
  }

  async getReservationById(id: number): Promise<Reservation> {
    const response = await this.api.get<any>(`/reservations/${id}`);
    // Map backend field names (resId) to frontend field names (reservationId)
    return {
      ...response.data,
      reservationId: response.data.resId || response.data.reservationId,
    };
  }

  async createReservation(data: ReservationCreate): Promise<string> {
    // Convert date strings to Date objects for Spring Boot
    const payload = {
      ...data,
      dateDebut: data.dateDebut ? new Date(data.dateDebut).toISOString() : null,
      dateFin: data.dateFin ? new Date(data.dateFin).toISOString() : null,
    };
    const response = await this.api.post<string>('/reservations/createReservation', payload);
    return response.data;
  }

  async checkIn(id: number): Promise<string> {
    const response = await this.api.post<string>(`/reservations/${id}/checkin`);
    return response.data;
  }

  async checkOut(id: number): Promise<string> {
    const response = await this.api.post<string>(`/reservations/${id}/checkout`);
    return response.data;
  }

  async cancelReservation(id: number): Promise<string> {
    try {
      const response = await this.api.post<string>(`/reservations/${id}/cancel`);
      // Handle both string responses and object responses
      if (typeof response.data === 'string') {
        return response.data;
      }
      return JSON.stringify(response.data);
    } catch (error: any) {
      console.error('Cancel reservation API error:', error);
      throw error;
    }
  }

  async addServiceToReservation(resId: number, serviceId: number): Promise<string> {
    try {
      if (!resId || resId === 0) {
        throw new Error('Invalid reservation ID');
      }
      if (!serviceId || serviceId === 0) {
        throw new Error('Invalid service ID');
      }
      
      console.log('API: Adding service', serviceId, 'to reservation', resId);
      const response = await this.api.post<string>(`/reservations/${resId}/add-service/${serviceId}`);
      console.log('API: Add service response:', response.data);
      
      // Handle both string responses and object responses
      if (typeof response.data === 'string') {
        return response.data;
      }
      return JSON.stringify(response.data);
    } catch (error: any) {
      console.error('Add service API error:', error);
      console.error('Error details:', {
        resId,
        serviceId,
        response: error.response,
        message: error.message
      });
      throw error;
    }
  }

  async getReservationServices(resId: number): Promise<Service[] | string> {
    try {
      console.log('API: Fetching services for reservation:', resId);
      const response = await this.api.get<Service[] | string>(`/reservations/${resId}/services`);
      console.log('API: Response status:', response.status);
      console.log('API: Response data type:', typeof response.data);
      console.log('API: Response data:', response.data);
      
      // Backend might return an error message as a string, or a list of services
      if (typeof response.data === 'string') {
        // It's an error message
        console.log('API: Received string response (error):', response.data);
        return response.data;
      }
      
      // It's an array of services
      if (Array.isArray(response.data)) {
        console.log('API: Received array with', response.data.length, 'services');
        return response.data;
      }
      
      // Unexpected format
      console.error('API: Unexpected response format:', response.data);
      return 'Unexpected response format from server';
    } catch (error: any) {
      console.error('API: Get reservation services error:', error);
      console.error('API: Error response:', error.response);
      
      // If it's a 403 or other error, return the error message
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          return errorData;
        }
        return JSON.stringify(errorData);
      }
      
      // Re-throw to be handled by the component
      throw error;
    }
  }

  // Services endpoints
  async getServices(): Promise<Service[]> {
    const response = await this.api.get<Service[]>('/services');
    return response.data;
  }

  async getServiceById(id: number): Promise<Service> {
    const response = await this.api.get<Service>(`/services/${id}`);
    return response.data;
  }

  async createService(data: ServiceCreate): Promise<string> {
    const response = await this.api.post<string>('/services/addsevice', data);
    return response.data;
  }

  async deleteService(id: number): Promise<string> {
    const response = await this.api.delete<string>(`/services/${id}`);
    return response.data;
  }

  // Factures endpoints

  async createFacture(resId: number): Promise<string> {
    const response = await this.api.post<string>(`/factures/reservation/${resId}`);
    return response.data;
  }

  async markFacturePaid(id: number): Promise<string> {
    const response = await this.api.post<string>(`/factures/${id}/payer`);
    return response.data;
  }
// add near top of file (inside ApiService class)
private normalizeFacture(raw: any) {
  return {
    factureId: raw.factureId ?? raw.FACTURE_ID ?? raw.id ?? 0,
    reservationId: raw.reservationId ?? raw.resId ?? raw.RES_ID ?? 0,
    montantTotal: Number(raw.montantTotal ?? raw.montTotal ?? raw.MONT_TOTAL ?? 0),
    statutPaiement: raw.statutPaiement ?? raw.statut ?? raw.STATUT_PAIEMENT ?? 'INCONNU',
    dateCreation: raw.dateCreation ?? raw.dateEmission ?? raw.DATE_EMISSION ?? undefined,
    datePaiement: raw.datePaiement ?? raw.paidAt ?? raw.DATE_PAIEMENT ?? undefined,
  };
}

async getFactureById(id: number): Promise<any> {
  const response = await this.api.get<any>(`/factures/${id}`);
  // return raw data (component will normalize) or return normalized object:
  return this.normalizeFacture(response.data);
}

// Add this method to fetch all invoices (requires backend GET /factures)
async getFactures(): Promise<any[]> {
  const response = await this.api.get<any[]>('/factures');
  return response.data.map((raw: any) => this.normalizeFacture(raw));
}

  // Users endpoints (admin)
  async getUsers(): Promise<any[]> {
    const response = await this.api.get<any[]>('/utilisateurs');
    return response.data;
  }

  // Roles
  async getRoles(): Promise<any[]> {
    const response = await this.api.get<any[]>('/roles');
    return response.data;
  }

  async getUserById(id: number): Promise<any> {
    const response = await this.api.get<any>(`/utilisateurs/${id}`);
    return response.data;
  }

  async createUser(data: { login: string; motDePasseHash: string; roleId: number }): Promise<string> {
    // Backend expects UtilisateurCreateDTO with fields: roleId, login, motDePasseHash
    const payload = {
      roleId: data.roleId,
      login: data.login,
      motDePasseHash: data.motDePasseHash,
    };
    const response = await this.api.post<string>('/utilisateurs', payload);
    return response.data;
  }

  async deleteUser(id: number): Promise<string> {
    const response = await this.api.delete<string>(`/utilisateurs/${id}`);
    return response.data;
  }
}

export const apiService = new ApiService();

