CREATE OR REPLACE PROCEDURE supprimer_chambre(
  p_id_chambre IN NUMBER
)
AS
BEGIN
  -- Suppression 
  DELETE
  FROM CHAMBRE
  WHERE CHAMBRE_ID = p_id_chambre;

  -- Vérification si la suppression a été effectuée
  IF SQL%ROWCOUNT = 0 THEN
    DBMS_OUTPUT.PUT_LINE('Aucune chambre avec l''ID ' || p_id_chambre || ' n''a été trouvée.');
  ELSE
    DBMS_OUTPUT.PUT_LINE('Chambre avec l''ID ' || p_id_chambre || ' supprimée avec succès.');
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Une erreur s''est produite : ' || SQLERRM);
END;
/