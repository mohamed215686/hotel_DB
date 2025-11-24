SET SERVEROUTPUT ON;
DECLARE
    v_msg VARCHAR2(200);
    ---v_last_res_id NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('--- TEST 4: CANCEL RESERVATION ---');

    -- 1. Get the ID of the reservation
    ---SELECT MAX(RES_ID) INTO v_last_res_id FROM RESERVATION;
    DBMS_OUTPUT.PUT_LINE('Cancelling Reservation ID: ' || 3);

    -- 2. Call the cancel procedure
    P_ANNULER_RESERVATION(3, v_msg);
    
    DBMS_OUTPUT.PUT_LINE('Server Response: ' || v_msg);
END;
/
select * from reservation;