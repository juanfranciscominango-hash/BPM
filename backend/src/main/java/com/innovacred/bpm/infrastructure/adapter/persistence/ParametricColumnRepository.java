package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.ParametricColumn;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParametricColumnRepository extends JpaRepository<ParametricColumn, Long> {
}
