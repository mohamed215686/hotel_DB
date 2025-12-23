export interface LoginRequest {
  login: string;
  motDePasse: string;
}

export interface LoginResponse {
  utilisateurId: number;
  roleId: number;
  username: string;
  roleName: string;
  message?: string;
}

export interface ClientSignup {
  login: string;
  motDePasse: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  adresse: string;
}

export interface Chambre {
  chambreId: number;
  numero: string;
  type: string;
  prixNuitee: number;
  statut: string;
}

export interface ChambreCreate {
  numero: string;
  type: string;
  prixNuitee: number;
  statut: string;
}

export interface Client {
  clientId: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  adresse: string;
  utilisateurId?: number;
}

export interface ClientCreate {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  adresse: string;
}

export interface Reservation {
  reservationId: number;
  clientId: number;
  chambreId: number;
  dateDebut: string;
  dateFin: string;
  statut: string;
  dateCreation?: string;
}

export interface ReservationCreate {
  clientId: number;
  chambreId: number;
  dateDebut: string;
  dateFin: string;
  statut: string;
}

export interface Service {
  serviceId: number;
  libelle: string;
  tarifUnitaire: number;
}

export interface ServiceCreate {
  libelle: string;
  tarifUnitaire: number;
}

export interface Facture {
  factureId: number;
  reservationId: number;
  montantTotal: number;
  statutPaiement: string;
  dateCreation?: string;
  datePaiement?: string;
}

export interface LigneFacture {
  detailId: number;
  factureId: number;
  description?: string;
  quantite?: number;
  prixUnitaire?: number;
  sousTotal?: number;
}

export interface ChangePassword {
  newPassword: string;
}

export interface ChangeUsername {
  newUsername: string;
}


