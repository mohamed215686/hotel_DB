SET SERVEROUTPUT ON;
DECLARE
    v_msg VARCHAR2(200);
    v_last_res_id NUMBER;
    v_valid_service_id NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('--- TEST 3: ADD SERVICE (SMART) ---');

    -- 1. Get the ID of the reservation we just made
    SELECT MAX(RES_ID) INTO v_last_res_id FROM RESERVATION;
    
    IF v_last_res_id IS NULL THEN
        DBMS_OUTPUT.PUT_LINE('CRITICAL ERROR: No reservation found. Run Test 2 first.');
        RETURN;
    END IF;
    DBMS_OUTPUT.PUT_LINE('Testing on Reservation ID: ' || v_last_res_id);

    -- 2. Find a valid Service ID (The first one found in the table)
    BEGIN
        SELECT MAX(SERVICE_ID) INTO v_valid_service_id FROM SERVICE;
        
        IF v_valid_service_id IS NULL THEN
             DBMS_OUTPUT.PUT_LINE('CRITICAL ERROR: The SERVICE table is empty!');
             RETURN;
        END IF;
        DBMS_OUTPUT.PUT_LINE('Using Service ID: ' || v_valid_service_id);
    END;

    -- 3. Add the service dynamically
    P_AJOUTER_SERVICE(v_last_res_id, v_valid_service_id, v_msg);
    
    DBMS_OUTPUT.PUT_LINE('Server Response: ' || v_msg);
END;
/
select * from associe;