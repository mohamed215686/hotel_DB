-- NOUVELLE VERSION CORRIGÉE DU TRIGGER TRG_LIGNE_FACTURE_MAJ_FACTURE
-- Objectif : Ajuster le MONT_TOTAL dans FACTURE SANS lire la table LIGNE_FACTURE (mutante)

CREATE OR REPLACE TRIGGER TRG_LIGNE_FACTURE_MAJ_FACTURE
AFTER INSERT OR UPDATE OR DELETE ON LIGNE_FACTURE
FOR EACH ROW
BEGIN
    IF INSERTING THEN
        -- Ajouter le montant de la nouvelle ligne
        UPDATE FACTURE
        SET MONT_TOTAL = MONT_TOTAL + :NEW.MONTANT_PARTIEL
        WHERE FACTURE_ID = :NEW.FACTURE_ID;

    ELSIF DELETING THEN
        -- Soustraire le montant de la ligne supprimée
        UPDATE FACTURE
        SET MONT_TOTAL = MONT_TOTAL - :OLD.MONTANT_PARTIEL
        WHERE FACTURE_ID = :OLD.FACTURE_ID;

    ELSIF UPDATING THEN
        -- Soustraire l'ancienne valeur et ajouter la nouvelle valeur
        UPDATE FACTURE
        SET MONT_TOTAL = MONT_TOTAL - :OLD.MONTANT_PARTIEL + :NEW.MONTANT_PARTIEL
        WHERE FACTURE_ID = :NEW.FACTURE_ID;
        
    END IF;

EXCEPTION
    -- Nous conservons l'exception pour le logging
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Erreur critique dans TRG_LIGNE_FACTURE_MAJ_FACTURE: ' || SQLERRM);
        -- NE PAS FAIRE DE ROLLBACK ICI, LA TRANSACTION EST EN COURS
        -- RAISE; -- Optionnel si vous voulez que l'erreur remonte
END TRG_LIGNE_FACTURE_MAJ_FACTURE ;
/

PROMPT Trigger TRG_LIGNE_FACTURE_MAJ_FACTURE recompile et corrige (non-mutating).