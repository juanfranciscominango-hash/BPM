package com.innovacred.bpm.infrastructure.config;

import com.innovacred.bpm.domain.entity.DynamicColumnDefinition;
import com.innovacred.bpm.infrastructure.adapter.persistence.DynamicColumnDefinitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DynamicColumnSeeder implements CommandLineRunner {

    private final DynamicColumnDefinitionRepository repository;

    @Override
    public void run(String... args) throws Exception {
        if (repository.count() == 0) {
            saveColumn("task", "Tarea", "name", "text");
            saveColumn("caseNumber", "Número Caso", "numeroCaso", "text");
            saveColumn("client", "Cliente / ID", "nombreCompleto", "text");
            saveColumn("creditDetails", "Detalles Crédito", "monto", "currency");
            saveColumn("assignee", "Asignado a", "assignee", "text");
            saveColumn("advisor", "Asesor", "asesor", "text");
            saveColumn("createTime", "Fecha Creación", "createTime", "date");
        }
    }

    private void saveColumn(String key, String label, String variable, String type) {
        DynamicColumnDefinition col = new DynamicColumnDefinition();
        col.setKeyName(key);
        col.setLabelName(label);
        col.setVariableName(variable);
        col.setColumnType(type);
        col.setVisible(true);
        repository.save(col);
    }
}
