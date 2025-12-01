CREATE OR REPLACE TRIGGER T_AUDIT_CLIENT_CHANGES
AFTER UPDATE ON CLIENT
FOR EACH ROW
DECLARE
    v_user_id NUMBER;
BEGIN
    -- Try to identify the user linked to this client
    v_user_id := :NEW.UTILISATEUR_ID;

    -- Log only if contact info changes
    IF :OLD.TELEPHONE <> :NEW.TELEPHONE OR :OLD.ADRESSE <> :NEW.ADRESSE THEN
        INSERT INTO SYSTEM_AUDIT (
            AUDIT_ID, UTILISATEUR_ID, TABLENAME, ACTION, OLDVALUE, NEWVALUE, TIMESTAMP
        ) VALUES (
            AUDIT_SEQ.NEXTVAL, 
            v_user_id, 
            'CLIENT', 
            'Update Info Client ' || :NEW.CLIENT_ID, 
            'Tel: ' || :OLD.TELEPHONE || ' / Adr: ' || :OLD.ADRESSE, 
            'Tel: ' || :NEW.TELEPHONE || ' / Adr: ' || :NEW.ADRESSE, 
            SYSDATE
        );
    END IF;
END T_AUDIT_CLIENT_CHANGES;
/