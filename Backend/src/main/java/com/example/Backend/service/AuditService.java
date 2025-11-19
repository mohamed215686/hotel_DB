package com.example.Backend.service;

import com.example.Backend.model.Audit;
import com.example.Backend.repository.AuditRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class AuditService {

    @Autowired
    private AuditRepository auditRepository;

    // 🚩 CHANGE 2: Remove the unused repository field
    // @Autowired
    // private UtilisateurRepository utilisateurRepository;

    public void logAction(Long utilisateurId, String tableName, String action, String oldValue, String newValue) {

        Audit audit = new Audit();

        // 1. Set the raw User ID (No need for database lookup)
        audit.setUtilisateurId(utilisateurId);

        // 2. Set Audit details
        audit.setTableName(tableName);
        audit.setAction(action);
        audit.setOldValue(oldValue);
        audit.setNewValue(newValue);
        audit.setTimestamp(new Date());

        // 3. Save the record
        try {
            auditRepository.save(audit);
        } catch (Exception e) {
            System.err.println("Failed to log audit entry: " + e.getMessage());
        }
    }
}