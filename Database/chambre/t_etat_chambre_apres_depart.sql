CREATE TRIGGER trg_update_etat_chambre_apres_depart
AFTER UPDATE ON reservation
FOR EACH ROW
BEGIN
    IF OLD.date_fin < CURDATE() THEN
        UPDATE chambre
        SET STATUT = 'Disponible'
        WHERE CHAMBRE_ID = OLD.chambre_id;
    END IF;
END;

-- DROP TRIGGER trg_update_etat_chambre_apres_depart;
