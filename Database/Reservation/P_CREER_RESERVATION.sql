CREATE OR REPLACE PROCEDURE P_CREER_RESERVATION (
    p_client_id IN NUMBER,
    p_chambre_id IN NUMBER,
    p_date_debut IN DATE,
    p_date_fin IN DATE,
    p_message OUT VARCHAR2
) AS
    v_is_available NUMBER;
    v_res_id NUMBER;
BEGIN
    IF p_date_debut >= p_date_fin THEN
        p_message := 'Erreur: La date de fin doit être après la date de début.';
        RETURN;
    END IF;

    v_is_available := F_VERIFIER_DISPONIBILITE(p_chambre_id, p_date_debut, p_date_fin);

    IF v_is_available = 0 THEN
        p_message := 'Erreur: La chambre n''est pas disponible.';
        RETURN;
    END IF;

    INSERT INTO RESERVATION (RES_ID, CLIENT_ID, CHAMBRE_ID, DATE_DEBUT, DATE_FIN, STATUT, DATE_CREATION)
    VALUES (RESERVATION_SEQ.NEXTVAL, p_client_id, p_chambre_id, p_date_debut, p_date_fin, 'Confirmée', SYSDATE)
    RETURNING RES_ID INTO v_res_id;

    IF TRUNC(p_date_debut) = TRUNC(SYSDATE) THEN
        UPDATE CHAMBRE SET STATUT = 'Occupé' WHERE CHAMBRE_ID = p_chambre_id;
    END IF;

    COMMIT;
    p_message := 'Succès: Réservation ' || v_res_id || ' créée.';
EXCEPTION WHEN OTHERS THEN ROLLBACK; p_message := 'Erreur SQL: ' || SQLERRM;
END P_CREER_RESERVATION;