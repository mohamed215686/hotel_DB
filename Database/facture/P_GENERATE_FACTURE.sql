-- 1. PROCEDURE: GÉNÉRER UNE FACTURE (Create Bill)
-- Calculates totals and fills FACTURE + LIGNE_FACTURE
CREATE OR REPLACE PROCEDURE P_GENERATE_FACTURE (
    p_res_id IN NUMBER,
    p_message OUT VARCHAR2
) AS
    v_facture_id     NUMBER;
    v_room_subtotal  NUMBER;
    v_services_total NUMBER;
    v_grand_total    NUMBER;
    v_num_nights     NUMBER;
    v_reservation    RESERVATION%ROWTYPE;
    v_chambre        CHAMBRE%ROWTYPE;
    v_count          NUMBER;
BEGIN
    -- A. Check if bill already exists
    SELECT COUNT(*) INTO v_count FROM FACTURE WHERE RES_ID = p_res_id;
    IF v_count > 0 THEN
        p_message := 'Erreur: Une facture existe déjà pour cette réservation.';
        RETURN;
    END IF;

    -- B. Get Data
    SELECT * INTO v_reservation FROM RESERVATION WHERE RES_ID = p_res_id;
    SELECT * INTO v_chambre FROM CHAMBRE WHERE CHAMBRE_ID = v_reservation.CHAMBRE_ID;

    -- C. Calculate Room Cost
    v_num_nights := CEIL(v_reservation.DATE_FIN - v_reservation.DATE_DEBUT);
    IF v_num_nights = 0 THEN v_num_nights := 1; END IF;
    v_room_subtotal := v_num_nights * v_chambre.PRIX_NUITEE;

    -- D. Calculate Services Cost
    SELECT NVL(SUM(s.TARIF_UNITAIRE), 0) INTO v_services_total
    FROM ASSOCIE a JOIN SERVICE s ON a.SERVICE_ID = s.SERVICE_ID
    WHERE a.RES_ID = p_res_id;

    v_grand_total := v_room_subtotal + v_services_total;

    -- E. Create Facture Header
    INSERT INTO FACTURE (FACTURE_ID, RES_ID, MONT_TOTAL, STATUT_PAIEMENT, DATE_EMISSION)
    VALUES (FACTURE_SEQ.NEXTVAL, p_res_id, v_grand_total, 'Non payé', SYSDATE)
    RETURNING FACTURE_ID INTO v_facture_id;

    -- F. Create Line Item: The Room
    INSERT INTO LIGNE_FACTURE (
        LIGNE_FACTURE_ID, FACTURE_ID, LIBELLE_DESCRIPTION, QUANTITE, 
        PRIX_UNITAIRE, DATE_CONSOMMATION, MONTANT_PARTIEL
    ) VALUES (
        LIGNE_FACTURE_SEQ.NEXTVAL, v_facture_id, 
        'Chambre ' || v_chambre.NUMERO, v_num_nights, 
        v_chambre.PRIX_NUITEE, v_reservation.DATE_DEBUT, v_room_subtotal
    );

    -- G. Create Line Items: The Services
    FOR svc IN (
        SELECT s.LIBELLE, s.TARIF_UNITAIRE 
        FROM ASSOCIE a JOIN SERVICE s ON a.SERVICE_ID = s.SERVICE_ID 
        WHERE a.RES_ID = p_res_id
    ) LOOP
        INSERT INTO LIGNE_FACTURE (
            LIGNE_FACTURE_ID, FACTURE_ID, LIBELLE_DESCRIPTION, QUANTITE, 
            PRIX_UNITAIRE, DATE_CONSOMMATION, MONTANT_PARTIEL
        ) VALUES (
            LIGNE_FACTURE_SEQ.NEXTVAL, v_facture_id, svc.LIBELLE, 1, 
            svc.TARIF_UNITAIRE, SYSDATE, svc.TARIF_UNITAIRE
        );
    END LOOP;

    COMMIT;
    p_message := 'Succès: Facture ' || v_facture_id || ' générée.';
EXCEPTION WHEN OTHERS THEN ROLLBACK; p_message := 'Erreur: ' || SQLERRM;
END P_GENERATE_FACTURE;