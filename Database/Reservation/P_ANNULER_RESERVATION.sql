CREATE OR REPLACE PROCEDURE P_ANNULER_RESERVATION (
    p_res_id IN NUMBER,
    p_message OUT VARCHAR2
) AS
    v_chambre_id NUMBER;
    v_date_debut DATE;
    v_date_fin DATE;
BEGIN
    SELECT CHAMBRE_ID, DATE_DEBUT, DATE_FIN INTO v_chambre_id, v_date_debut, v_date_fin
    FROM RESERVATION WHERE RES_ID = p_res_id;

    UPDATE RESERVATION SET STATUT = 'Annulée' WHERE RES_ID = p_res_id;

    IF TRUNC(SYSDATE) BETWEEN TRUNC(v_date_debut) AND TRUNC(v_date_fin) THEN
        UPDATE CHAMBRE SET STATUT = 'Disponible' WHERE CHAMBRE_ID = v_chambre_id;
    END IF;

    COMMIT;
    p_message := 'Succès: Réservation ' || p_res_id || ' annulée.';
EXCEPTION
    WHEN NO_DATA_FOUND THEN p_message := 'Erreur: Réservation introuvable.';
    WHEN OTHERS THEN ROLLBACK; p_message := 'Erreur: ' || SQLERRM;
END P_ANNULER_RESERVATION;