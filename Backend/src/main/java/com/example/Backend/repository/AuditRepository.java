package com.example.Backend.repository;

import com.example.Backend.model.Audit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditRepository extends JpaRepository<Audit, Long> {
    // Audit logs are typically read, but rarely updated/deleted via PK.
    // Custom finder: List<Audit> findByTableNameOrderByTimestampDesc(String tableName);
}