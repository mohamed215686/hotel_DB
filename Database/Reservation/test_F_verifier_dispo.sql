SET SERVEROUTPUT ON;
DECLARE
    v_result NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('--- TEST 1: AVAILABILITY ---');
    
    -- 1. Check Room 102 (Which is 'Occupied' in our test data) for Today
    v_result := F_VERIFIER_DISPONIBILITE(p_chambre_id => 2, p_date_debut => SYSDATE, p_date_fin => SYSDATE+1);
    
    IF v_result = 0 THEN
        DBMS_OUTPUT.PUT_LINE('Case 1 (Occupied Room): PASSED (Returned 0)');
    ELSE
        DBMS_OUTPUT.PUT_LINE('Case 1 (Occupied Room): FAILED (Returned ' || v_result || ')');
    END IF;

    -- 2. Check Room 101 (Which is 'Available') for Next Month
    v_result := F_VERIFIER_DISPONIBILITE(p_chambre_id => 1, p_date_debut => SYSDATE+30, p_date_fin => SYSDATE+31);
    
    IF v_result = 1 THEN
        DBMS_OUTPUT.PUT_LINE('Case 2 (Free Room): PASSED (Returned 1)');
    ELSE
        DBMS_OUTPUT.PUT_LINE('Case 2 (Free Room): FAILED (Returned ' || v_result || ')');
    END IF;
END;
/
/*--- TEST 1: AVAILABILITY ---
Case 1 (Occupied Room): FAILED (Returned 1)
Case 2 (Free Room): PASSED (Returned 1)


PL/SQL procedure successfully completed.*/