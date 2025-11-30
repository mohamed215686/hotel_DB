CREATE OR REPLACE PROCEDURE p_statut_chammbre (
    p_chambre_id IN NUMBER,
    p_date_debut IN DATE,
    p_date_fin IN DATE
) 
AS
    v_count NUMBER; 
BEGIN
    -- Compter le nombre de réservations pour la chambre donnée
    SELECT COUNT(*)
      INTO v_count
      FROM RESERVATION
     WHERE CHAMBRE_ID = p_chambre_id
       AND STATUT <> 'Annulée'
       AND NOT (
               DATE_FIN <= p_date_debut OR DATE_DEBUT >= p_date_fin);

    -- Vérifier si la chambre est disponible ou occupée
    IF v_count > 0 THEN
        DBMS_OUTPUT.PUT_LINE('Chambre occupée !');
    ELSE
        DBMS_OUTPUT.PUT_LINE('Chambre disponible !');
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20001, 'Une erreur s''est produite : ' || SQLERRM);
END;
/