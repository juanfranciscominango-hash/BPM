package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.QueryFormDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QueryFormDefinitionRepository extends JpaRepository<QueryFormDefinition, Long> {
    Optional<QueryFormDefinition> findByName(String name);
}
