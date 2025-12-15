--TEST CLIENT ROLE

-- test select from chambres
select * from chambre;

--test select from services
select * from service;

-- test select from client : error
select * from client;


-- test F_TROUVER_CHAMBRE_LIBRE
SET SERVEROUTPUT ON;
DECLARE
    v_result NUMBER;
    v_type   VARCHAR2(50) := 'Simple'; 
    v_start  DATE := TO_DATE('05/01/2026', 'DD/MM/YYYY');      
    v_end    DATE := TO_DATE('08/01/2026', 'DD/MM/YYYY');  
BEGIN
    -- Call the function
    v_result := SYSTEM.F_TROUVER_CHAMBRE_LIBRE(v_type, v_start, v_end);

    DBMS_OUTPUT.PUT_LINE('-------------------------------------------');
    DBMS_OUTPUT.PUT_LINE('Searching for a free "' || v_type || '" room...');
    DBMS_OUTPUT.PUT_LINE('From: ' || v_start || ' To: ' || v_end);
    
    -- Check the result
    IF v_result IS NOT NULL THEN
        DBMS_OUTPUT.PUT_LINE('✅ SUCCESS! chambre ID: ' || v_result);
    ELSE
        DBMS_OUTPUT.PUT_LINE('❌ FAILED ');
    END IF;
    DBMS_OUTPUT.PUT_LINE('-------------------------------------------');
END;
/


-- test P_CREER_RESERVATION
SET SERVEROUTPUT ON;

DECLARE
    v_message VARCHAR2(4000); 
    v_client_id NUMBER := 2;  
    v_room_id   NUMBER := 1; 
BEGIN
    
    SYSTEM.P_CREER_RESERVATION(
        p_client_id  => v_client_id,
        p_chambre_id => v_room_id,
        p_date_debut => TO_DATE('05/01/2026', 'DD/MM/YYYY'),
        p_date_fin   => TO_DATE('08/01/2026', 'DD/MM/YYYY'),
        p_message    => v_message
    );

    -- 2. Print the result
    DBMS_OUTPUT.PUT_LINE('------------------------------------');
    DBMS_OUTPUT.PUT_LINE('Result: ' || v_message);
    DBMS_OUTPUT.PUT_LINE('------------------------------------');
END;
/

--test select  from resrvation
select * from resrvation;

-- test P_AJOUTER_SERVICE : errer 
SET SERVEROUTPUT ON;
DECLARE
    v_message    VARCHAR2(4000);
    v_res_id     NUMBER := 3;  
    v_service_id NUMBER := 2;  
BEGIN
    DBMS_OUTPUT.PUT_LINE('--- TEST START ---');
    SYSTEM.P_AJOUTER_SERVICE(v_res_id, v_service_id, v_message);
    DBMS_OUTPUT.PUT_LINE('Attempt 1 Result: ' || v_message);

    DBMS_OUTPUT.PUT_LINE('--- TEST END ---');
END;
/

-- test select from associe : error
select * from associe;
    


