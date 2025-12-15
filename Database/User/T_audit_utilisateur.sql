CREATE OR REPLACE TRIGGER SYSTEM.T_AUDIT_UTILISATEUR
AFTER UPDATE ON SYSTEM.UTILISATEUR
FOR EACH ROW
BEGIN
    
    IF (:OLD.LOGIN <> :NEW.LOGIN) OR 
       (:OLD.ROLE_ID <> :NEW.ROLE_ID) OR 
       (:OLD.ACTIF <> :NEW.ACTIF) OR 
       (:OLD.MOTDEPASSEHASH <> :NEW.MOTDEPASSEHASH) THEN

        INSERT INTO SYSTEM.SYSTEM_AUDIT (
            AUDIT_ID, 
            UTILISATEUR_ID, 
            TABLENAME, 
            ACTION, 
            OLDVALUE, 
            NEWVALUE, 
            TIMESTAMP
        )
        VALUES (
            SYSTEM.SYSTEM_AUDIT_SEQ.NEXTVAL, 
            1,  
            'UTILISATEUR', 
            'Update User ID ' || :NEW.UTILISATEUR_ID || ' (by DB User: ' || USER || ')',
            'Login: ' || :OLD.LOGIN || ' | Role: ' || :OLD.ROLE_ID || ' | Actif: ' || :OLD.ACTIF,
            'Login: ' || :NEW.LOGIN || ' | Role: ' || :NEW.ROLE_ID || ' | Actif: ' || :NEW.ACTIF, 
            SYSDATE
        );
    END IF;
END;
/