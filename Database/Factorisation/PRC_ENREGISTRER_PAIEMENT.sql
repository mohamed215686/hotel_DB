CREATE OR REPLACE PROCEDURE PRC_ENREGISTRER_PAIEMENT (
    p_facture_id IN NUMBER,
    p_statut_paiement IN VARCHAR2 DEFAULT 'PAYÉ'
)
AS
BEGIN
    UPDATE FACTURE
    SET 
        STATUT_PAIEMENT = p_statut_paiement,
        DATE_PAIEMENT = SYSDATE -- Enregistrer la date du paiement
    WHERE FACTURE_ID = p_facture_id;
    
    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Facture ID ' || p_facture_id || ' non trouvee.');
    END IF;

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Paiement enregistre pour la facture ' || p_facture_id || '. Statut: ' || p_statut_paiement);

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END PRC_ENREGISTRER_PAIEMENT;
/