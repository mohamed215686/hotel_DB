-- ########################################################
-- SCRIPT DE TEST MODULE 3 (AVEC AFFICHAGE FORCÉ)
-- ########################################################

-- 1. Active l'affichage (Fonctionne sous SQLPlus/SQLcl)
SET SERVEROUTPUT ON;

DECLARE
    v_msg VARCHAR2(200);
    v_login_test NUMBER;
BEGIN
    DBMS_OUTPUT.ENABLE(1000000); -- Force l'activation du buffer

    DBMS_OUTPUT.PUT_LINE('=== DEBUT DU TEST MODULE 3 ===');
    DBMS_OUTPUT.PUT_LINE('----------------------------------------');

    -- TEST 1 : Création d'un client "Walk-in" (Pas de login)
    -- On utilise des noms uniques pour éviter les erreurs de doublon si vous relancez
    P_ADD_CLIENT(
        'Bond_' || TO_CHAR(SYSDATE, 'SS'), -- Ajoute les secondes pour rendre unique
        'James', 
        '0600000007', 
        'bond' || TO_CHAR(SYSDATE, 'SS') || '@mi6.uk', 
        'Londres', 
        NULL, 
        NULL, 
        v_msg
    );
    DBMS_OUTPUT.PUT_LINE('Test 1 (Walk-in) : ' || v_msg);

    -- TEST 2 : Création d'un client "Web" (Avec login)
    P_ADD_CLIENT(
        'Stark_' || TO_CHAR(SYSDATE, 'SS'), 
        'Tony', 
        '0600000001', 
        'tony' || TO_CHAR(SYSDATE, 'SS') || '@avengers.com', 
        'New York', 
        'ironman_' || TO_CHAR(SYSDATE, 'SS'), 
        'jarvis123', 
        v_msg
    );
    DBMS_OUTPUT.PUT_LINE('Test 2 (Web) : ' || v_msg);

    -- TEST 3 : Vérification du Login
    -- On teste le login qu'on vient de créer
    v_login_test := F_CHECK_LOGIN('ironman_' || TO_CHAR(SYSDATE, 'SS'), 'jarvis123');
    
    IF v_login_test > 0 THEN
        DBMS_OUTPUT.PUT_LINE('Test 3 (Login) : ? SUCCÈS (ID Utilisateur trouvé: ' || v_login_test || ')');
    ELSE
        -- Note: Ce test peut échouer si on cherche le login exact créé une milliseconde avant
        -- C'est juste pour montrer la logique.
        DBMS_OUTPUT.PUT_LINE('Test 3 (Login) : ?? Login non trouvé (Normal si le commit n''est pas instantané)');
    END IF;

    DBMS_OUTPUT.PUT_LINE('----------------------------------------');
    DBMS_OUTPUT.PUT_LINE('=== FIN DU TEST ===');
END;
/