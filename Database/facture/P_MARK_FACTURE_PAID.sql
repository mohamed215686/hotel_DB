-- 2. PROCEDURE: PAYER FACTURE (Mark as Paid)
CREATE OR REPLACE PROCEDURE P_MARK_FACTURE_PAID (
    p_facture_id IN NUMBER,
    p_message OUT VARCHAR2
) AS
BEGIN
    UPDATE FACTURE
    SET STATUT_PAIEMENT = 'Payé', DATE_PAIEMENT = SYSDATE
    WHERE FACTURE_ID = p_facture_id;

    IF SQL%ROWCOUNT = 0 THEN
        p_message := 'Erreur: Facture introuvable.';
    ELSE
        COMMIT;
        p_message := 'Succès: Facture marquée comme payée.';
    END IF;
EXCEPTION WHEN OTHERS THEN ROLLBACK; p_message := 'Erreur: ' || SQLERRM;
END P_MARK_FACTURE_PAID ;