package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.ScreenDefinition;
import com.innovacred.bpm.infrastructure.adapter.persistence.ScreenDefinitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ScreenService {

    private final ScreenDefinitionRepository repository;

    public ScreenDefinition save(ScreenDefinition definition) {
        return repository.save(definition);
    }

    public List<ScreenDefinition> listByProcess(String processKey) {
        return repository.findByProcessKey(processKey);
    }

    public Optional<ScreenDefinition> getForTask(String processKey, String taskKey) {
        return repository.findByProcessKeyAndTaskKey(processKey, taskKey);
    }

    public List<ScreenDefinition> listAll() {
        return repository.findAll();
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
