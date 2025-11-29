-- 3. TRIGGER: AUDIT FACTURE (Track Status Changes)
CREATE OR REPLACE TRIGGER T_AUDIT_FACTURE_CHANGES
AFTER UPDATE ON FACTURE
FOR EACH ROW
DECLARE
    -- Variable pour recuperer l'utilisateur courant (Optionnel mais recommande)
    v_user_id SYSTEM_AUDIT.UTILISATEUR_ID%TYPE := NULL; 
    -- Si vous etes en contexte applicatif (ex: APEX/J2EE) vous pouvez utiliser une fonction
    -- pour recuperer l'ID de l'utilisateur connecte a la place de NULL.
BEGIN
    IF :OLD.STATUT_PAIEMENT <> :NEW.STATUT_PAIEMENT THEN
        
        -- CORRECTION: La liste des colonnes doit correspondre a la liste des valeurs
        INSERT INTO SYSTEM_AUDIT (
            AUDIT_ID, 
            UTILISATEUR_ID,  -- Ajout de la colonne UTILISATEUR_ID (avec NULL si inconnu)
            TABLENAME, 
            ACTION, 
            OLDVALUE, 
            NEWVALUE, 
            TIMESTAMP
        )
        VALUES (
            AUDIT_SEQ.NEXTVAL, 
            v_user_id,               -- Valeur pour UTILISATEUR_ID (NULL)
            'FACTURE',               -- Valeur pour TABLENAME
            'Paiement Update',       -- Valeur pour ACTION
            'Ancien: ' || :OLD.STATUT_PAIEMENT,  -- Valeur pour OLDVALUE
            'Nouveau: ' || :NEW.STATUT_PAIEMENT, -- Valeur pour NEWVALUE
            SYSDATE                  -- Valeur pour TIMESTAMP
        );
        
    END IF;
END T_AUDIT_FACTURE_CHANGES;
/