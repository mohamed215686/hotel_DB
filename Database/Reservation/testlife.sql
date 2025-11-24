-- ########################################################
-- SCRIPT DE TEST : CYCLE DE VIE (RECHERCHE -> CHECK-IN -> CHECK-OUT)
-- ########################################################
SET SERVEROUTPUT ON;

DECLARE
    v_msg VARCHAR2(200);
    v_chambre_libre_id NUMBER;
    v_res_id NUMBER;
    v_statut_res VARCHAR2(20);
    v_statut_chambre VARCHAR2(20);
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== DÉBUT DU TEST ===');

    -- --------------------------------------------------------
    -- 1. TEST DE LA RECHERCHE (F_TROUVER_CHAMBRE_LIBRE)
    -- --------------------------------------------------------
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('--- ETAPE 1 : Recherche d''une chambre "Simple" pour CE SOIR ---');
    
    -- On cherche une chambre Simple pour aujourd'hui jusqu'à demain
    v_chambre_libre_id := F_TROUVER_CHAMBRE_LIBRE('Simple', SYSDATE, SYSDATE+1);

    IF v_chambre_libre_id IS NOT NULL THEN
        DBMS_OUTPUT.PUT_LINE('[OK] Chambre libre trouvée : ID ' || v_chambre_libre_id);
    ELSE
        DBMS_OUTPUT.PUT_LINE('[ERREUR] Aucune chambre libre trouvée (vérifiez vos données).');
        RETURN; -- Stop le test si pas de chambre
    END IF;

    -- --------------------------------------------------------
    -- 2. PRÉPARATION : CRÉATION D'UNE RÉSERVATION
    -- --------------------------------------------------------
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('--- ETAPE 2 : Création de la réservation pour le test ---');
    
    -- On utilise la procédure de Personne 1 pour réserver cette chambre
    -- Client ID 1 (Admin/Test), Pour AUJOURD'HUI (SYSDATE)
    P_CREER_RESERVATION(1, v_chambre_libre_id, SYSDATE, SYSDATE+1, v_msg);
    DBMS_OUTPUT.PUT_LINE(v_msg);

    -- Récupérer l'ID de la réservation qu'on vient de créer
    SELECT MAX(RES_ID) INTO v_res_id FROM RESERVATION WHERE CLIENT_ID = 1;
    DBMS_OUTPUT.PUT_LINE('-> ID Réservation généré : ' || v_res_id);

    -- --------------------------------------------------------
    -- 3. TEST DU CHECK-IN (P_CHECK_IN)
    -- --------------------------------------------------------
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('--- ETAPE 3 : Le client arrive (Check-In) ---');
    
    P_CHECK_IN(v_res_id, v_msg);
    DBMS_OUTPUT.PUT_LINE('Résultat Check-In : ' || v_msg);

    -- VÉRIFICATION
    SELECT STATUT INTO v_statut_res FROM RESERVATION WHERE RES_ID = v_res_id;
    SELECT STATUT INTO v_statut_chambre FROM CHAMBRE WHERE CHAMBRE_ID = v_chambre_libre_id;

    IF v_statut_res = 'En cours' AND v_statut_chambre = 'Occupé' THEN
        DBMS_OUTPUT.PUT_LINE('[OK] Vérification : Réservation est "En cours" et Chambre est "Occupé".');
    ELSE
        DBMS_OUTPUT.PUT_LINE('[ECHEC] Vérification : Statuts incorrects (' || v_statut_res || ' / ' || v_statut_chambre || ')');
    END IF;

    -- --------------------------------------------------------
    -- 4. TEST DU CHECK-OUT (P_CHECK_OUT)
    -- --------------------------------------------------------
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('--- ETAPE 4 : Le client part (Check-Out) ---');
    
    P_CHECK_OUT(v_res_id, v_msg);
    DBMS_OUTPUT.PUT_LINE('Résultat Check-Out : ' || v_msg);

    -- VÉRIFICATION
    SELECT STATUT INTO v_statut_res FROM RESERVATION WHERE RES_ID = v_res_id;
    SELECT STATUT INTO v_statut_chambre FROM CHAMBRE WHERE CHAMBRE_ID = v_chambre_libre_id;

    IF v_statut_res = 'Terminée' AND v_statut_chambre = 'Disponible' THEN
        DBMS_OUTPUT.PUT_LINE('[OK] Vérification : Réservation est "Terminée" et Chambre est "Disponible".');
    ELSE
        DBMS_OUTPUT.PUT_LINE('[ECHEC] Vérification : Statuts incorrects (' || v_statut_res || ' / ' || v_statut_chambre || ')');
    END IF;

    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('=== FIN DU TEST ===');
END;
/
select * from reservation;