--TEST MANAGER ROLE

--test select from facture et ligne_facture
SELECT * FROM facture;
select * from ligne_facture;


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
-- test select from utilisateur
select * from utilisateur;

--test select from system audit
select * from system_audit;

-- test PRC_ADD_UTILISATEUR
SET SERVEROUTPUT ON;

DECLARE
    v_msg VARCHAR2(4000);
BEGIN
    
    DELETE FROM UTILISATEUR WHERE LOGIN = 'Test1';
    COMMIT;

    DBMS_OUTPUT.PUT_LINE('--- START TESTS ---');

    -- TEST 1: SUCCESS (Add a valid user)
    SYSTEM.PRC_ADD_UTILISATEUR(
        p_role_id => 2,           
        p_login   => 'Test1', 
        p_motdepassehash => 'Pass123!', 
        p_message => v_msg
    );
    DBMS_OUTPUT.PUT_LINE('1. Result: ' || v_msg);

    -- TEST 2: FAIL - DUPLICATE (Try to add the same user again)
    SYSTEM.PRC_ADD_UTILISATEUR(2, 'Test1', 'Pass123!', v_msg);
    DBMS_OUTPUT.PUT_LINE('2. Result: ' || v_msg);

    -- TEST 3: FAIL - INVALID ROLE (Try to add with Role ID -99)
    SYSTEM.PRC_ADD_UTILISATEUR(-99, 'test2', 'Pass123!', v_msg);
    DBMS_OUTPUT.PUT_LINE('3. Result: ' || v_msg);
    
    DBMS_OUTPUT.PUT_LINE('--- END TESTS ---');
END;
/


--test P_CHANGE_PASSWORD
SET SERVEROUTPUT ON;

DECLARE
    v_message  VARCHAR2(4000);
    v_user_id  NUMBER := 5;           
    v_new_pass VARCHAR2(100) := 'NewHash'; 
BEGIN
    DBMS_OUTPUT.PUT_LINE('--- TEST START ---');

    -- 1. SUCCESS SCENARIO: Update existing user
    SYSTEM.P_CHANGE_PASSWORD(
        p_user_id  => v_user_id,
        p_new_pass => v_new_pass,
        p_message  => v_message
    );
    DBMS_OUTPUT.PUT_LINE('Attempt 1 (Valid User): ' || v_message);

    -- 2. FAILURE SCENARIO: User does not exist
    SYSTEM.P_CHANGE_PASSWORD(
        p_user_id  => -99999,   -- Impossible ID
        p_new_pass => 'Won''tWork',
        p_message  => v_message
    );
    DBMS_OUTPUT.PUT_LINE('Attempt 2 (Invalid User): ' || v_message);

    DBMS_OUTPUT.PUT_LINE('--- TEST END ---');
END;
/

select * from utilisateur;



select * from utilisateur;
SELECT * FROM SYSTEM_AUDIT;


--test select from role 
select * from SYSTEM.role;