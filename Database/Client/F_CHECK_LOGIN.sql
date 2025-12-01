CREATE OR REPLACE FUNCTION F_CHECK_LOGIN (
    p_login IN VARCHAR2,
    p_password_hash IN VARCHAR2
) RETURN NUMBER AS
    v_user_id NUMBER;
BEGIN
    -- Try to find active user with matching credentials
    SELECT UTILISATEUR_ID INTO v_user_id 
    FROM UTILISATEUR
    WHERE LOGIN = p_login 
      AND MOTDEPASSEHASH = p_password_hash 
      AND ACTIF = 'Y';
      
    RETURN v_user_id; -- Success
EXCEPTION
    WHEN NO_DATA_FOUND THEN 
        RETURN 0; -- Failure
END F_CHECK_LOGIN;
/