CREATE OR REPLACE TRIGGER trg_update_etat_chambre_apres_depart
AFTER UPDATE ON reservation
FOR EACH ROW
BEGIN
    -- 1. Use :OLD instead of OLD
    -- 2. Use SYSDATE instead of CURDATE()
    IF :OLD.date_fin < SYSDATE THEN
        UPDATE chambre
        SET STATUT = 'Disponible'
        WHERE CHAMBRE_ID = :OLD.chambre_id; -- Don't forget the colon here too
    END IF;
END;
/
