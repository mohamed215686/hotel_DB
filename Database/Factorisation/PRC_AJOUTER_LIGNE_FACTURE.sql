-- ========================================================
CREATE OR REPLACE PROCEDURE PRC_AJOUTER_LIGNE_FACTURE (
    p_facture_id IN NUMBER,
    p_description IN VARCHAR2,
    p_prix_unitaire IN NUMBER,
    p_quantite IN NUMBER,
    p_date_consommation IN DATE
)
AS
BEGIN
    -- Insertion de la ligne de facture. 
    -- Le trigger TRG_LIGNE_FACTURE_MONT_PART calculera MONTANT_PARTIEL
    -- Le trigger TRG_LIGNE_FACTURE_MAJ_FACTURE mettra a jour MONT_TOTAL dans FACTURE
    INSERT INTO LIGNE_FACTURE (
        LIGNE_FACTURE_ID, 
        FACTURE_ID, 
        LIBELLE_DESCRIPTION, 
        PRIX_UNITAIRE, 
        QUANTITE, 
        DATE_CONSOMMATION
    )
    VALUES (
        LIGNE_FACTURE_SEQ.NEXTVAL, -- Utiliser la sequence
        p_facture_id, 
        p_description, 
        p_prix_unitaire, 
        p_quantite, 
        NVL(p_date_consommation, SYSDATE)
    );
    
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Ligne de facture ajoutee a la facture ' || p_facture_id);

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END  PRC_AJOUTER_LIGNE_FACTURE ;
/