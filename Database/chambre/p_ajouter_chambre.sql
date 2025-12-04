CREATE OR REPLACE PROCEDURE add_chambre(
  p_numero IN VARCHAR2,
  p_type IN VARCHAR2,
  p_prix IN NUMBER,
  p_statut IN VARCHAR2
)
AS
  -- Variable qui stocke le message d'erreur
  v_message VARCHAR2(255);
BEGIN
  -- Validation des paramètres d'entrée
  IF p_numero IS NULL OR p_type IS NULL OR p_prix IS NULL OR p_statut IS NULL THEN
    RAISE_APPLICATION_ERROR(-20001, 'Les paramètres d''entrée ne peuvent pas être NULL.');
  END IF;

  IF p_prix < 0 THEN
    RAISE_APPLICATION_ERROR(-20002, 'Le prix ne peut pas être négatif.');
  END IF;

  -- Insertion dans la table CHAMBRE
  INSERT INTO CHAMBRE (CHAMBRE_ID, NUMERO, TYPE, PRIX_NUITEE, STATUT) 
  VALUES(CHAMBRE_SEQ.NEXTVAL, p_numero, p_type, p_prix, p_statut);

  -- Afficher un message de confirmation 
  v_message := 'Chambre ajoutée avec succès !';
  DBMS_OUTPUT.PUT_LINE(v_message);

EXCEPTION
  WHEN DUP_VAL_ON_INDEX THEN
    ROLLBACK;
    v_message := 'Erreur : Une chambre avec ce numéro existe déjà.';
    DBMS_OUTPUT.PUT_LINE(v_message);

  WHEN OTHERS THEN
    ROLLBACK;
    v_message := 'Une erreur inattendue s''est produite : ' || SQLERRM;
    DBMS_OUTPUT.PUT_LINE(v_message);
END;
/
