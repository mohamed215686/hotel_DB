SET SERVEROUTPUT ON;
SET ECHO ON;

PROMPT ===================================================
PROMPT -- 1. PREPARATION DES DONNEES DE BASE --
PROMPT ===================================================

-- Initialisation des Séquences (s'assurer qu'on part de 1 pour les tests)
-- NOTE: Si les tables contiennent deja des donnees, ceci peut creer des erreurs de PK.
-- Pour un environnement de test propre, il faudrait d'abord vider les tables (TRUNCATE).
BEGIN
    -- Suppression simple pour cet exemple, ajustez si necessaire
    EXECUTE IMMEDIATE 'DELETE FROM LIGNE_FACTURE';
    EXECUTE IMMEDIATE 'DELETE FROM FACTURE';
    EXECUTE IMMEDIATE 'DELETE FROM RESERVATION';
    EXECUTE IMMEDIATE 'DELETE FROM CLIENT';
    EXECUTE IMMEDIATE 'DELETE FROM SERVICE';
    EXECUTE IMMEDIATE 'DELETE FROM CHAMBRE';
    EXECUTE IMMEDIATE 'DELETE FROM SYSTEM_AUDIT';
    EXECUTE IMMEDIATE 'DELETE FROM UTILISATEUR';
    EXECUTE IMMEDIATE 'DELETE FROM ROLE';
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

-- 1.1. Roles et Utilisateurs (pour l'audit)
INSERT INTO ROLE VALUES (ROLE_SEQ.NEXTVAL, 'RECEPTIONNISTE', 'Gestion des reservations');
INSERT INTO UTILISATEUR VALUES (UTILISATEUR_SEQ.NEXTVAL, 1, 'admin', 'passhash', 'Y');
PROMPT Role et Utilisateur de test insérés.

-- 1.2. Client, Chambre, Service
INSERT INTO CLIENT (CLIENT_ID, NOM, PRENOM, TELEPHONE, EMAIL) VALUES (CLIENT_SEQ.NEXTVAL, 'Dupont', 'Jean', '0612345678', 'jean.dupont@mail.com');
INSERT INTO CHAMBRE (CHAMBRE_ID, NUMERO, TYPE, PRIX_NUITEE, STATUT) VALUES (CHAMBRE_SEQ.NEXTVAL, '101', 'Simple', 50.00, 'LIBRE');
INSERT INTO CHAMBRE (CHAMBRE_ID, NUMERO, TYPE, PRIX_NUITEE, STATUT) VALUES (CHAMBRE_SEQ.NEXTVAL, '205', 'Suite', 150.00, 'OCCUPÉE');
INSERT INTO SERVICE (SERVICE_ID, LIBELLE, TARIF_UNITAIRE) VALUES (SERVICE_SEQ.NEXTVAL, 'Petit Dejeuner', 10.00);
INSERT INTO SERVICE (SERVICE_ID, LIBELLE, TARIF_UNITAIRE) VALUES (SERVICE_SEQ.NEXTVAL, 'Parking Jour', 5.00);
PROMPT Données Client, Chambre et Services insérées.

-- 1.3. Reservation (Utilise CLIENT_ID=1 et CHAMBRE_ID=1)
INSERT INTO RESERVATION (RES_ID, CLIENT_ID, CHAMBRE_ID, DATE_DEBUT, DATE_FIN, STATUT, DATE_CREATION)
VALUES (RESERVATION_SEQ.NEXTVAL, 1, 1, DATE '2025-12-10', DATE '2025-12-13', 'CONFIRMÉE', SYSDATE); -- 3 nuitées
PROMPT Reservation de test (RES_ID=1) insérée.

COMMIT;

PROMPT ===================================================
PROMPT -- 2. TEST DE LA PROCEDURE PRC_CREER_FACTURE --
PROMPT ===================================================
DECLARE
    v_res_id NUMBER := 1;
    v_facture_id NUMBER;
BEGIN
    -- Appel de la Procedure 1
    PRC_CREER_FACTURE(p_res_id => v_res_id, p_facture_id => v_facture_id);
    
    -- Verification initiale
    DBMS_OUTPUT.PUT_LINE('--- Verification apres creation de facture ---');
    FOR rec IN (SELECT FACTURE_ID, MONT_TOTAL, STATUT_PAIEMENT FROM FACTURE WHERE RES_ID = v_res_id) LOOP
        DBMS_OUTPUT.PUT_LINE('FACTURE CREE : ID=' || rec.FACTURE_ID || ', MONT_TOTAL=' || rec.MONT_TOTAL || ' (DOIT ETRE 0)');
    END LOOP;
    
    -- Stocker l'ID de la nouvelle facture pour la suite des tests
    SELECT FACTURE_ID INTO v_facture_id FROM FACTURE WHERE RES_ID = v_res_id;
    
    -- TEST 1.1: TEST DU TRIGGER TRG_LIGNE_FACTURE_MONT_PART et TRG_LIGNE_FACTURE_MAJ_FACTURE
    -- Ligne 1: Nuitées (3 x 50.00 = 150.00)
    PRC_AJOUTER_LIGNE_FACTURE(
        p_facture_id => v_facture_id, 
        p_description => '3 Nuitées Chambre 101', 
        p_prix_unitaire => 50.00, 
        p_quantite => 3, 
        p_date_consommation => DATE '2025-12-13'
    );
    
    -- Ligne 2: Service Petit Dejeuner (10.00)
    PRC_AJOUTER_LIGNE_FACTURE(
        p_facture_id => v_facture_id, 
        p_description => 'Service: Petit Dejeuner', 
        p_prix_unitaire => 10.00, 
        p_quantite => 1, 
        p_date_consommation => DATE '2025-12-11'
    );

    -- Ligne 3: Service Parking (5.00)
    PRC_AJOUTER_LIGNE_FACTURE(
        p_facture_id => v_facture_id, 
        p_description => 'Service: Parking', 
        p_prix_unitaire => 5.00, 
        p_quantite => 1, 
        p_date_consommation => DATE '2025-12-12'
    );

    -- Verification apres ajout des lignes
    DBMS_OUTPUT.PUT_LINE('--- Verification apres ajout des lignes ---');
    -- Total Attendu: 150.00 + 10.00 + 5.00 = 165.00
    FOR rec IN (SELECT FACTURE_ID, MONT_TOTAL, STATUT_PAIEMENT FROM FACTURE WHERE FACTURE_ID = v_facture_id) LOOP
        DBMS_OUTPUT.PUT_LINE('FACTURE MAJ : ID=' || rec.FACTURE_ID || ', MONT_TOTAL=' || rec.MONT_TOTAL || ' (DOIT ETRE 165.00)');
    END LOOP;
    
    -- TEST 1.2: TEST DES FONCTIONS FNC_CALCULER_MONTANT_FACTURE et FNC_GET_STATUT_PAIEMENT
    DBMS_OUTPUT.PUT_LINE('--- Verification des fonctions ---');
    DBMS_OUTPUT.PUT_LINE('FNC_CALCULER_MONTANT_FACTURE : ' || FNC_CALCULER_MONTANT_FACTURE(v_facture_id) || ' (DOIT ETRE 165)');
    DBMS_OUTPUT.PUT_LINE('FNC_GET_STATUT_PAIEMENT : ' || FNC_GET_STATUT_PAIEMENT(v_facture_id) || ' (DOIT ETRE NON PAYÉ)');

    -- TEST 1.3: TEST DU TRIGGER TRG_LIGNE_FACTURE_MONT_PART (Update)
    -- Modifier la Quantite du Petit Dejeuner a 2 (10.00 * 2 = 20.00)
    -- Nouveau total attendu : 150.00 + 20.00 + 5.00 = 175.00
    UPDATE LIGNE_FACTURE SET QUANTITE = 2 WHERE LIBELLE_DESCRIPTION = 'Service: Petit Dejeuner' AND FACTURE_ID = v_facture_id;
    COMMIT;

    DBMS_OUTPUT.PUT_LINE('--- Verification apres UPDATE de LIGNE_FACTURE ---');
    FOR rec IN (SELECT FACTURE_ID, MONT_TOTAL FROM FACTURE WHERE FACTURE_ID = v_facture_id) LOOP
        DBMS_OUTPUT.PUT_LINE('FACTURE APRES UPDATE LIGNE : MONT_TOTAL=' || rec.MONT_TOTAL || ' (DOIT ETRE 175.00)');
    END LOOP;
    DBMS_OUTPUT.PUT_LINE('FNC_CALCULER_MONTANT_FACTURE : ' || FNC_CALCULER_MONTANT_FACTURE(v_facture_id) || ' (DOIT ETRE 175)');


    -- TEST 1.4: TEST DE LA PROCEDURE PRC_ENREGISTRER_PAIEMENT et TRG_AUDIT_FACTURE_CHANGES
    PRC_ENREGISTRER_PAIEMENT(p_facture_id => v_facture_id);

    DBMS_OUTPUT.PUT_LINE('--- Verification apres paiement ---');
    FOR rec IN (SELECT STATUT_PAIEMENT FROM FACTURE WHERE FACTURE_ID = v_facture_id) LOOP
        DBMS_OUTPUT.PUT_LINE('STATUT_PAIEMENT APRES PAIEMENT : ' || rec.STATUT_PAIEMENT || ' (DOIT ETRE PAYÉ)');
    END LOOP;
    DBMS_OUTPUT.PUT_LINE('FNC_GET_STATUT_PAIEMENT : ' || FNC_GET_STATUT_PAIEMENT(v_facture_id) || ' (DOIT ETRE PAYÉ)');

    -- TEST 1.5: VERIFICATION DU TRIGGER D'AUDIT
    DBMS_OUTPUT.PUT_LINE('--- Verification de l''Audit ---');
    FOR rec IN (SELECT OLDVALUE, NEWVALUE, TIMESTAMP FROM SYSTEM_AUDIT WHERE TABLENAME = 'FACTURE' ORDER BY TIMESTAMP DESC) LOOP
        DBMS_OUTPUT.PUT_LINE('AUDIT ENREGISTRE: Ancien Statut: ' || rec.OLDVALUE || ', Nouveau Statut: ' || rec.NEWVALUE);
    END LOOP;


END;
/


PROMPT ===================================================
PROMPT -- FIN DES TESTS --
PROMPT ===================================================


