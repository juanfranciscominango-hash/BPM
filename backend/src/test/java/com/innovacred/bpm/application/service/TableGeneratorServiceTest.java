package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.MetaAttribute;
import com.innovacred.bpm.domain.entity.MetaEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class TableGeneratorServiceTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private TableGeneratorService tableGeneratorService;

    @Test
    void testGenerateTable() {
        // Given
        MetaEntity entity = new MetaEntity();
        entity.setName("Credito");

        MetaAttribute attr1 = new MetaAttribute();
        attr1.setName("monto");
        attr1.setType("NUMBER");

        MetaAttribute attr2 = new MetaAttribute();
        attr2.setName("nombre");
        attr2.setType("TEXT");

        List<MetaAttribute> attributes = Arrays.asList(attr1, attr2);

        // When
        tableGeneratorService.generateTable(entity, attributes);

        // Then
        ArgumentCaptor<String> sqlCaptor = ArgumentCaptor.forClass(String.class);
        verify(jdbcTemplate).execute(sqlCaptor.capture());

        String executedSql = sqlCaptor.getValue();
        assertTrue(executedSql.contains("CREATE TABLE IF NOT EXISTS DY_CREDITO"));
        assertTrue(executedSql.contains("monto NUMERIC"));
        assertTrue(executedSql.contains("nombre TEXT"));
    }
}
