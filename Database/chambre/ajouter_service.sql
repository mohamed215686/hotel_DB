CREATE OR REPLACE PROCEDURE ajouter_service(
    p_libelle_service IN VARCHAR2,
    p_tarif_unitaire  IN NUMBER
)
AS
   v_count NUMBER;
BEGIN
    --verifier si ce service existe dans la table servcie
    SELECT  COUNT(*) INTO v_count
    FROM SERVICE
    WHERE LIBELLE = p_libelle_service;
    
    IF v_count > 0 THEN 
      RAISE_APPLICATION_ERROR(-20008, 'erreur: ce service' || p_libelle_service || ' existe deja');
    END IF;
    
    -- Validation du tarif
    IF p_tarif_unitaire < 0 THEN
        RAISE_APPLICATION_ERROR(-20004, 'Erreur : Le tarif unitaire ne peut pas être négatif.');
    END IF;

    -- Insertion
    INSERT INTO service (SERVICE_ID, LIBELLE, TARIF_UNITAIRE)
    VALUES (SERVICE_SEQ.NEXTVAL, p_libelle_service, p_tarif_unitaire);

    -- DBMS_OUTPUT.PUT_LINE('Service ' || p_libelle_service || '  ajouté avec succès.');

EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        RAISE_APPLICATION_ERROR(-20005, 'Erreur : Un service avec ce libellé existe déjà.');
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20000, 'Erreur inattendue lors de l''ajout du service : ' || SQLERRM);
END;
/
