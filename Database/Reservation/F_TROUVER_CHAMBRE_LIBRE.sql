CREATE OR REPLACE FUNCTION F_TROUVER_CHAMBRE_LIBRE (
    p_type IN VARCHAR2,
    p_date_debut IN DATE,
    p_date_fin IN DATE
) RETURN NUMBER AS
    v_chambre_id NUMBER;
BEGIN
    -- Find the first room of the requested TYPE that has NO overlapping reservations
    SELECT MIN(c.CHAMBRE_ID)
    INTO v_chambre_id
    FROM CHAMBRE c
    WHERE c.TYPE = p_type
      AND c.CHAMBRE_ID NOT IN (
          SELECT r.CHAMBRE_ID 
          FROM RESERVATION r
          WHERE r.STATUT <> 'Annulée'
          AND (r.DATE_DEBUT < p_date_fin AND r.DATE_FIN > p_date_debut)
      );

    RETURN v_chambre_id; -- Returns NULL if no room found
EXCEPTION
    WHEN NO_DATA_FOUND THEN RETURN NULL;
END F_TROUVER_CHAMBRE_LIBRE;