package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.ParametricTable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParametricTableRepository extends JpaRepository<ParametricTable, Long> {
}
