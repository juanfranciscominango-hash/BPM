package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.MetaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MetaEntityRepository extends JpaRepository<MetaEntity, Long> {}
