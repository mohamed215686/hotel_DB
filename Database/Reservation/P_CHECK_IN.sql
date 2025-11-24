CREATE OR REPLACE PROCEDURE P_CHECK_IN (
    p_res_id IN NUMBER,
    p_message OUT VARCHAR2
) AS
    v_statut VARCHAR2(20);
    v_date_debut DATE;
    v_chambre_id NUMBER;
BEGIN
    -- Get info
    SELECT STATUT, DATE_DEBUT, CHAMBRE_ID 
    INTO v_statut, v_date_debut, v_chambre_id
    FROM RESERVATION WHERE RES_ID = p_res_id;

    -- Checks
    IF v_statut <> 'Confirmée' THEN
        p_message := 'Erreur: Seules les réservations confirmées peuvent faire le Check-In.';
        RETURN;
    END IF;

    IF TRUNC(SYSDATE) < TRUNC(v_date_debut) THEN
        p_message := 'Erreur: Trop tôt pour le Check-In (Début: ' || v_date_debut || ')';
        RETURN;
    END IF;

    -- Update Reservation and Room
    UPDATE RESERVATION SET STATUT = 'En cours' WHERE RES_ID = p_res_id;
    UPDATE CHAMBRE SET STATUT = 'Occupé' WHERE CHAMBRE_ID = v_chambre_id;

    COMMIT;
    p_message := 'Succès: Check-In effectué. Bienvenue au client.';
EXCEPTION
    WHEN NO_DATA_FOUND THEN p_message := 'Erreur: Réservation introuvable.';
    WHEN OTHERS THEN ROLLBACK; p_message := 'Erreur: ' || SQLERRM;
END P_CHECK_IN;