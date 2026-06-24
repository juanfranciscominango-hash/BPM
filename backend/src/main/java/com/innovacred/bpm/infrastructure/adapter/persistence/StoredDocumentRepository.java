package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.StoredDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StoredDocumentRepository extends JpaRepository<StoredDocument, Long> {
    List<StoredDocument> findByProcessInstanceId(String processInstanceId);
}
