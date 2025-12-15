--TEST ADMIN ROLE

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

--test select from utilisateur 
select * from utilisateur;

-- test T_AUDIT_UTILISATEUR
UPDATE UTILISATEUR 
SET ACTIF = 'N' 
WHERE UTILISATEUR_ID = 5; 
SELECT * FROM SYSTEM_AUDIT;

-- test delete a utilisateur non actif
delete from utilisateur  WHERE UTILISATEUR_ID = 6; 
select * from utilisateur;



--ajouter role 
select * from SYSTEM.role;
INSERT INTO SYSTEM.ROLE (ROLE_ID, NOMROLE, DESCRIPTION) 
VALUES (ROLE_SEQ.NEXTVAL, 'securte', 'securety');
select * from SYSTEM.role;


--change role pour un utilisateur
UPDATE UTILISATEUR 
SET ROLE_ID = 3 
WHERE UTILISATEUR_ID = 4; 


