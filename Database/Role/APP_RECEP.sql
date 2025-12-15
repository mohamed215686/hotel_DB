--TEST RECEPTION ROLE


--test P_ADD_CLIENT
SET SERVEROUTPUT ON;

DECLARE
    v_message VARCHAR2(4000);
    -- Test Data variables
    v_email   VARCHAR2(100) := 'moh21@example.com';
BEGIN
    DBMS_OUTPUT.PUT_LINE('--- TEST START ---');
    SYSTEM.P_ADD_CLIENT(
        p_nom       => 'afkir',
        p_prenom    => 'mohamed',
        p_telephone => '0612345678',
        p_email     => v_email,
        p_adresse   => '123 Rue de la Paix',
        p_message   => v_message
    );
    DBMS_OUTPUT.PUT_LINE('Attempt 1 (New User): ' || v_message);

    SYSTEM.P_ADD_CLIENT(
        p_nom       => 'test',
        p_prenom    => 'Imposter',
        p_telephone => '0000000000',
        p_email     => v_email, 
        p_adresse   => 'Nowhere',
        p_message   => v_message
    );
    DBMS_OUTPUT.PUT_LINE('Attempt 2 (Duplicate): ' || v_message);

    DBMS_OUTPUT.PUT_LINE('--- TEST END ---');
END;
/

--test select from client 
select * from client;

--test select from reservation
select * from reservation;

-- test P_CREER_RESERVATION
SET SERVEROUTPUT ON;

DECLARE
    v_message VARCHAR2(4000); 
    v_client_id NUMBER := 6;  
    v_room_id   NUMBER := 1; 
BEGIN
    
    SYSTEM.P_CREER_RESERVATION(
        p_client_id  => v_client_id,
        p_chambre_id => v_room_id,
        p_date_debut => SYSDATE ,
        p_date_fin   => SYSDATE + 3,
        p_message    => v_message
    );

    DBMS_OUTPUT.PUT_LINE('------------------------------------');
    DBMS_OUTPUT.PUT_LINE('Result: ' || v_message);
    DBMS_OUTPUT.PUT_LINE('------------------------------------');
END;
/

select * from reservation;

-- test P_AJOUTER_SERVICE dans deux cas 
SET SERVEROUTPUT ON;

DECLARE
    v_message    VARCHAR2(4000);
    v_res_id     NUMBER := 13;  
    v_service_id NUMBER := 2;  
BEGIN
    DBMS_OUTPUT.PUT_LINE('--- TEST START ---');

    SYSTEM.P_AJOUTER_SERVICE(
        p_res_id     => v_res_id, 
        p_service_id => v_service_id, 
        p_message    => v_message
    );
    DBMS_OUTPUT.PUT_LINE('Attempt 1 Result: ' || v_message);

    
    SYSTEM.P_AJOUTER_SERVICE(
        p_res_id     => v_res_id, 
        p_service_id => v_service_id, 
        p_message    => v_message
    );
    DBMS_OUTPUT.PUT_LINE('Attempt 2 Result: ' || v_message);
    
    DBMS_OUTPUT.PUT_LINE('--- TEST END ---');
END;
/

-- test P_CHECK_IN et P_CHECK_OUT
SET SERVEROUTPUT ON;

DECLARE
    v_msg     VARCHAR2(4000);
    v_res_id  NUMBER := 13; 
BEGIN
    DBMS_OUTPUT.PUT_LINE('--- 1. ATTEMPT CHECK-IN ---');
    SYSTEM.P_CHECK_IN(v_res_id, v_msg);
    DBMS_OUTPUT.PUT_LINE(v_msg);

    DBMS_OUTPUT.PUT_LINE('--- 2. ATTEMPT CHECK-OUT ---');
    SYSTEM.P_CHECK_OUT(v_res_id, v_msg);
    DBMS_OUTPUT.PUT_LINE(v_msg);
END;
/

-- test P_GENERATE_FACTURE et P_MARK_FACTURE_PAID
SET SERVEROUTPUT ON;

DECLARE
    v_msg        VARCHAR2(4000);
    v_res_id     NUMBER := 7; 
    v_facture_id NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('--- STEP 1: GENERATE INVOICE ---');
    SYSTEM.P_GENERATE_FACTURE(v_res_id, v_msg);
    DBMS_OUTPUT.PUT_LINE(v_msg);


    BEGIN
        SELECT FACTURE_ID INTO v_facture_id 
        FROM FACTURE WHERE RES_ID = v_res_id;
    EXCEPTION WHEN NO_DATA_FOUND THEN 
        v_facture_id := NULL; 
    END;

    IF v_facture_id IS NOT NULL THEN
        DBMS_OUTPUT.PUT_LINE('--- STEP 2: PAY INVOICE (ID: ' || v_facture_id || ') ---');
        SYSTEM.P_MARK_FACTURE_PAID(v_facture_id, v_msg);
        DBMS_OUTPUT.PUT_LINE(v_msg);
    END IF;

    DBMS_OUTPUT.PUT_LINE('--- STEP 3: TEST DUPLICATE ERROR ---');
    SYSTEM.P_GENERATE_FACTURE(v_res_id, v_msg);
    DBMS_OUTPUT.PUT_LINE(v_msg);
END;
/

--test select from facture : error
SELECT * FROM SYSTEM.facture;


--test select from ligne_facture
select * from SYSTEM.ligne_facture;

-- test select from utilisateur
select * from SYSTEM.utilisateur;