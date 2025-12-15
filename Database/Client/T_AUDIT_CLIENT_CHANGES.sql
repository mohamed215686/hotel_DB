CREATE OR REPLACE TRIGGER T_AUDIT_CLIENT_CHANGES
AFTER UPDATE ON CLIENT
FOR EACH ROW
DECLARE
    v_user_id NUMBER;
BEGIN
    

    -- Log only if contact info changes
    IF :OLD.TELEPHONE <> :NEW.TELEPHONE OR :OLD.ADRESSE <> :NEW.ADRESSE THEN
        INSERT INTO SYSTEM_AUDIT (
            AUDIT_ID, UTILISATEUR_ID, TABLENAME, ACTION, OLDVALUE, NEWVALUE, TIMESTAMP
        ) VALUES (
            AUDIT_SEQ.NEXTVAL, 
            1, 
            'CLIENT', 
            'Update Info Client ' || :NEW.CLIENT_ID|| ' (by DB User: ' || USER || ')', 
            'Tel: ' || :OLD.TELEPHONE || ' / Adr: ' || :OLD.ADRESSE, 
            'Tel: ' || :NEW.TELEPHONE || ' / Adr: ' || :NEW.ADRESSE, 
            SYSDATE
        );
    END IF;
END T_AUDIT_CLIENT_CHANGES;
/