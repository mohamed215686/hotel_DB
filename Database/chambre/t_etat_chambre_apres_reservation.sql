

CREATE TRIGGER trg_update_etat_chambre_apres_reservation
AFTER INSERT ON reservation
FOR EACH ROW
BEGIN
    -- Mettre à jour le statut de la chambre associée à la réservation
    UPDATE chambre
    SET statut = 'Occupé'
    WHERE chambre_id = NEW.chambre_id;
END;


-- DROP TRIGGER trg_update_etat_chambre_apres_reservation;
