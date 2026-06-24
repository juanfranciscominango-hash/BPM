package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.MetaAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MetaAttributeRepository extends JpaRepository<MetaAttribute, Long> {
    List<MetaAttribute> findByEntityId(Long entityId);
}
