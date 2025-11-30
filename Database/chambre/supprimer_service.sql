CREATE OR REPLACE PROCEDURE supprimer_service(
 p_id_service IN NUMBER
)
 AS 
    v_count NUMBER;
 BEGIN
   --test si le service existe ou non 
   SELECT COUNT(*) INTO v_count
   FROM service
   WHERE service_id = p_id_service;
   
   IF v_count = 0 THEN 
     RAISE_APPLICATION_ERROR(-20006, 'erreur: cet id service inexistant !');
   END IF;
   
   SELECT COUNT(*) INTO v_count
   FROM associe
   WHERE service_id = p_id_service;
   
   IF v_count > 0 THEN 
     RAISE_APPLICATION_ERROR(-20007, 'erreur: suppression impossible car ce service est associé a une reservation !');
   END IF;
   
 --traitement de suppression du service
   DELETE FROM service
   WHERE service_id= p_id_service;
   
   EXCEPTION 
     WHEN OTHERS THEN 
        RAISE_APPLICATION_ERROR(-20000, 'Erreur inattendue lors de la suppression : ' || SQLERRM);
 END;
 
 
--test 
BEGIN
supprimer_service(9);
END;
--affichage des services apres modification
select * from service;