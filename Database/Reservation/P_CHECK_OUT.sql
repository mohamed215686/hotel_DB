CREATE OR REPLACE PROCEDURE P_CHECK_OUT (
    p_res_id IN NUMBER,
    p_message OUT VARCHAR2
) AS
    v_statut VARCHAR2(20);
    v_chambre_id NUMBER;
BEGIN
    SELECT STATUT, CHAMBRE_ID INTO v_statut, v_chambre_id
    FROM RESERVATION WHERE RES_ID = p_res_id;

    IF v_statut <> 'En cours' THEN
        p_message := 'Erreur: Le client n''est pas actuellement dans l''hôtel.';
        RETURN;
    END IF;

    -- Finish Reservation
    UPDATE RESERVATION SET STATUT = 'Terminée' WHERE RES_ID = p_res_id;
    
    -- Free the room (or mark as 'En nettoyage' if you want to be fancy)
    UPDATE CHAMBRE SET STATUT = 'Disponible' WHERE CHAMBRE_ID = v_chambre_id;

    COMMIT;
    p_message := 'Succès: Check-Out effectué. Chambre libérée.';
EXCEPTION
    WHEN OTHERS THEN ROLLBACK; p_message := 'Erreur: ' || SQLERRM;
END P_CHECK_OUT;