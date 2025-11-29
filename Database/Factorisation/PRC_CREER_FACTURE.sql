CREATE OR REPLACE PROCEDURE PRC_CREER_FACTURE (
    p_res_id IN NUMBER,
    p_facture_id OUT NUMBER
)
AS
    v_count NUMBER;
BEGIN
    -- Verifier si une facture existe deja pour cette reservation
    SELECT COUNT(*) INTO v_count FROM FACTURE WHERE RES_ID = p_res_id;

    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Une facture existe deja pour la reservation ID ' || p_res_id);
    ELSE
        -- Inserer la nouvelle facture
        INSERT INTO FACTURE (
            FACTURE_ID, 
            RES_ID, 
            MONT_TOTAL, 
            STATUT_PAIEMENT, 
            DATE_EMISSION
        )
        VALUES (
            FACTURE_SEQ.NEXTVAL,  -- Utiliser la sequence
            p_res_id, 
            0,                    -- Initialiser a 0 (les triggers mettront a jour)
            'NON PAYÉ',           -- Statut initial
            SYSDATE               -- Date d'emission
        )
        RETURNING FACTURE_ID INTO p_facture_id;
        
        COMMIT;
        DBMS_OUTPUT.PUT_LINE('Facture ID ' || p_facture_id || ' creee pour la reservation ' || p_res_id);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END PRC_CREER_FACTURE ; 
/