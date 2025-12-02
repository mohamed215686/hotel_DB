CREATE OR REPLACE PROCEDURE PRC_ADD_UTILISATEUR (
    p_role_id IN NUMBER,
    p_login IN VARCHAR2,
    p_motdepassehash IN VARCHAR2,
    p_message OUT VARCHAR2
)
AS
    v_count NUMBER;
BEGIN
    -- 1. Validate: Check if the login already exists
    SELECT COUNT(*) INTO v_count FROM UTILISATEUR WHERE LOGIN = p_login;
    IF v_count > 0 THEN
        p_message := 'Erreur: Le login est déjà utilisé.';
        RETURN;
    END IF;

    -- 2. Validate: Check if the ROLE_ID exists
    SELECT COUNT(*) INTO v_count FROM ROLE WHERE ROLE_ID = p_role_id;
    IF v_count = 0 THEN
        p_message := 'Erreur: Le ROLE_ID spécifié est invalide.';
        RETURN;
    END IF;

    -- 3. Insert into UTILISATEUR
    INSERT INTO UTILISATEUR (
        UTILISATEUR_ID, 
        ROLE_ID, 
        LOGIN, 
        MOTDEPASSEHASH, 
        ACTIF
    )
    VALUES (
        UTILISATEUR_SEQ.NEXTVAL,
        p_role_id,
        p_login,
        p_motdepassehash,
        'Y' -- Default to Active
    );

    COMMIT;
    p_message := 'Succès: Utilisateur ' || p_login || ' créé.';

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_message := 'Erreur SQL lors de l''ajout de l''utilisateur: ' || SQLERRM;
END PRC_ADD_UTILISATEUR;
/