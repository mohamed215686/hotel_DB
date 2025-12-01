CREATE OR REPLACE PROCEDURE P_CHANGE_PASSWORD (
    p_user_id IN NUMBER,
    p_new_pass IN VARCHAR2,
    p_message OUT VARCHAR2
) AS
BEGIN
    UPDATE UTILISATEUR 
    SET MOTDEPASSEHASH = p_new_pass 
    WHERE UTILISATEUR_ID = p_user_id;

    IF SQL%ROWCOUNT = 0 THEN
        p_message := 'Erreur: Utilisateur introuvable.';
    ELSE
        COMMIT;
        p_message := 'Succès: Mot de passe mis à jour.';
    END IF;
EXCEPTION WHEN OTHERS THEN 
    ROLLBACK;
    p_message := 'Erreur SQL: ' || SQLERRM;
END P_CHANGE_PASSWORD;
/