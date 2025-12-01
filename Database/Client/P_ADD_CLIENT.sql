CREATE OR REPLACE PROCEDURE P_ADD_CLIENT (
    p_nom IN VARCHAR2, 
    p_prenom IN VARCHAR2, 
    p_telephone IN VARCHAR2, 
    p_email IN VARCHAR2, 
    p_adresse IN VARCHAR2, 
    p_login IN VARCHAR2,          -- Can be NULL for walk-in clients
    p_password_hash IN VARCHAR2,  -- Can be NULL for walk-in clients
    p_message OUT VARCHAR2
) AS
    v_user_id NUMBER := NULL;
    v_count NUMBER;
    v_role_client_id NUMBER;
BEGIN
    -- 1. Check Email Uniqueness
    SELECT COUNT(*) INTO v_count FROM CLIENT WHERE EMAIL = p_email;
    IF v_count > 0 THEN 
        p_message := 'Erreur: Cet email est déjà utilisé.'; 
        RETURN; 
    END IF;

    -- 2. Create User Account (Only if login is provided)
    IF p_login IS NOT NULL THEN
        -- Check Login Uniqueness
        SELECT COUNT(*) INTO v_count FROM UTILISATEUR WHERE LOGIN = p_login;
        IF v_count > 0 THEN 
            p_message := 'Erreur: Ce login est déjà pris.'; 
            RETURN; 
        END IF;

        -- Get 'Client' Role ID
        BEGIN
            SELECT ROLE_ID INTO v_role_client_id FROM ROLE WHERE NOMROLE = 'Client';
        EXCEPTION WHEN NO_DATA_FOUND THEN
            v_role_client_id := 2; -- Fallback
        END;

        -- Insert User
        INSERT INTO UTILISATEUR (UTILISATEUR_ID, ROLE_ID, LOGIN, MOTDEPASSEHASH, ACTIF)
        VALUES (UTILISATEUR_SEQ.NEXTVAL, v_role_client_id, p_login, p_password_hash, 'Y')
        RETURNING UTILISATEUR_ID INTO v_user_id;
    END IF;

    -- 3. Create Client Profile
    INSERT INTO CLIENT (CLIENT_ID, UTILISATEUR_ID, NOM, PRENOM, TELEPHONE, EMAIL, ADRESSE, DATE_INSCRIPTION)
    VALUES (CLIENT_SEQ.NEXTVAL, v_user_id, p_nom, p_prenom, p_telephone, p_email, p_adresse, SYSDATE);
    
    COMMIT;
    
    IF v_user_id IS NOT NULL THEN
        p_message := 'Succès: Compte Web créé.';
    ELSE
        p_message := 'Succès: Client de passage créé.';
    END IF;

EXCEPTION 
    WHEN OTHERS THEN 
        ROLLBACK; 
        p_message := 'Erreur SQL: ' || SQLERRM;
END P_ADD_CLIENT;
/