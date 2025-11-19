package com.example.Backend.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "SYSTEM_AUDIT")
public class Audit {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "audit_seq_gen")
    @SequenceGenerator(name = "audit_seq_gen", sequenceName = "AUDIT_SEQ", allocationSize = 1)
    @Column(name = "AUDIT_ID")
    private Long auditId;

    // 🚩 CHANGE 1: Use @Column and Long type instead of @ManyToOne Utilisateur entity
    @Column(name = "UTILISATEUR_ID")
    private Long utilisateurId; // Renamed for clarity

    @Column(name = "TABLENAME", length = 100)
    private String tableName;

    @Column(name = "ACTION", length = 50)
    private String action; // e.g., 'INSERT', 'UPDATE', 'DELETE'

    @Lob // Maps to CLOB (Character Large Object)
    @Column(name = "OLDVALUE")
    private String oldValue;

    @Lob // Maps to CLOB (Character Large Object)
    @Column(name = "NEWVALUE")
    private String newValue;

    @Column(name = "TIMESTAMP")
    @Temporal(TemporalType.TIMESTAMP)
    private Date timestamp;

    // Default constructor (required by JPA)
    public Audit() {}

    // 🚩 CHANGE 2: Update Getters and Setters for Long utilisateurId

    public Long getAuditId() { return auditId; }
    public void setAuditId(Long auditId) { this.auditId = auditId; }

    // New Getter/Setter for the raw ID
    public Long getUtilisateurId() { return utilisateurId; }
    public void setUtilisateurId(Long utilisateurId) { this.utilisateurId = utilisateurId; }

    public String getTableName() { return tableName; }
    public void setTableName(String tableName) { this.tableName = tableName; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getOldValue() { return oldValue; }
    public void setOldValue(String oldValue) { this.oldValue = oldValue; }
    public String getNewValue() { return newValue; }
    public void setNewValue(String newValue) { this.newValue = newValue; }
    public Date getTimestamp() { return timestamp; }
    public void setTimestamp(Date timestamp) { this.timestamp = timestamp; }
}