CREATE OR REPLACE FUNCTION F_VERIFIER_DISPONIBILITE (
    p_chambre_id IN NUMBER,
    p_date_debut IN DATE,
    p_date_fin IN DATE
) RETURN NUMBER AS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM RESERVATION
    WHERE CHAMBRE_ID = p_chambre_id
      AND STATUT <> 'Annulée'
      AND (DATE_DEBUT < p_date_fin AND DATE_FIN > p_date_debut);

    IF v_count = 0 THEN RETURN 1;
    ELSE RETURN 0;
    END IF;
END F_VERIFIER_DISPONIBILITE;