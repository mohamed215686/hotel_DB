SET SERVEROUTPUT ON;
DECLARE
    v_msg VARCHAR2(200);
    v_valid_client_id NUMBER;
    v_valid_room_id NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('--- TEST 2: CREATE RESERVATION (SMART) ---');

    -- 1. Find a valid Client ID (The first one found in the table)
    BEGIN
        SELECT MIN(CLIENT_ID) INTO v_valid_client_id FROM CLIENT;
        
        IF v_valid_client_id IS NULL THEN
            DBMS_OUTPUT.PUT_LINE('CRITICAL ERROR: The CLIENT table is empty! Run the insert data script first.');
            RETURN;
        END IF;
        
        DBMS_OUTPUT.PUT_LINE('Using Client ID: ' || v_valid_client_id);
    END;

    -- 2. Find a valid Room ID (Room 301/Suite Royale)
    -- We look for it by number to be safe, or just pick a high ID
    BEGIN
        SELECT CHAMBRE_ID INTO v_valid_room_id FROM CHAMBRE WHERE NUMERO = '301';
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
             -- If 301 doesn't exist, just pick the max ID
            SELECT MAX(CHAMBRE_ID) INTO v_valid_room_id FROM CHAMBRE;
    END;
    DBMS_OUTPUT.PUT_LINE('Using Room ID: ' || v_valid_room_id);

    -- 3. Run the procedure with these valid IDs
    P_CREER_RESERVATION(
        p_client_id => v_valid_client_id, 
        p_chambre_id => v_valid_room_id,  
        p_date_debut => SYSDATE+5, 
        p_date_fin => SYSDATE+10, 
        p_message => v_msg
    );
    
    DBMS_OUTPUT.PUT_LINE('Server Response: ' || v_msg);
END;
/
select * from reservation;