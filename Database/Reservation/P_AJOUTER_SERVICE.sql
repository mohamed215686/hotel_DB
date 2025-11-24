CREATE OR REPLACE PROCEDURE P_AJOUTER_SERVICE (
    p_res_id IN NUMBER,
    p_service_id IN NUMBER,
    p_message OUT VARCHAR2
) AS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM ASSOCIE 
    WHERE RES_ID = p_res_id AND SERVICE_ID = p_service_id;

    IF v_count > 0 THEN p_message := 'Info: Ce service est déjà inclus.'; RETURN; END IF;

    INSERT INTO ASSOCIE (RES_ID, SERVICE_ID) VALUES (p_res_id, p_service_id);
    COMMIT;
    p_message := 'Succès: Service ajouté.';
EXCEPTION WHEN OTHERS THEN ROLLBACK; p_message := 'Erreur: ' || SQLERRM;
END P_AJOUTER_SERVICE ;