package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.MetaAttribute;
import com.innovacred.bpm.domain.entity.MetaEntity;
import com.innovacred.bpm.infrastructure.adapter.persistence.MetaAttributeRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.MetaEntityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MetaService {

    private final MetaEntityRepository entityRepository;
    private final MetaAttributeRepository attributeRepository;
    private final JdbcTemplate jdbcTemplate;

    @Transactional(readOnly = true)
    public List<MetaEntity> listarEntidades() {
        return entityRepository.findAll();
    }

    @Transactional
    public MetaEntity guardarEntidad(MetaEntity entity) {
        return entityRepository.save(entity);
    }

    @Transactional
    public void eliminarEntidad(Long id) {
        MetaEntity entity = entityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entidad no encontrada con ID: " + id));

        // 1. Eliminar primero todos los atributos hijos (evita FK constraint violation)
        List<MetaAttribute> atributos = attributeRepository.findByEntityId(id);
        if (!atributos.isEmpty()) {
            attributeRepository.deleteAll(atributos);
            log.info("Eliminados {} atributos de la entidad '{}'", atributos.size(), entity.getName());
        }

        // 2. Intentar eliminar la tabla física DY_ si existe
        String tableName = "DY_" + entity.getName().toUpperCase();
        try {
            jdbcTemplate.execute("DROP TABLE IF EXISTS " + tableName);
            log.info("Tabla física '{}' eliminada correctamente", tableName);
        } catch (Exception e) {
            // No lanzamos excepción: si la tabla no existía físicamente, continuamos
            log.warn("No se pudo eliminar la tabla física '{}': {}", tableName, e.getMessage());
        }

        // 3. Eliminar el registro de la entidad
        entityRepository.deleteById(id);
        log.info("Entidad '{}' (ID={}) eliminada correctamente", entity.getName(), id);
    }

    @Transactional(readOnly = true)
    public List<MetaAttribute> listarAtributos(Long entityId) {
        return attributeRepository.findByEntityId(entityId);
    }

    @Transactional
    public MetaAttribute guardarAtributo(MetaAttribute attribute) {
        return attributeRepository.save(attribute);
    }

    @Transactional
    public MetaAttribute actualizarAtributo(Long id, MetaAttribute datos) {
        MetaAttribute existing = attributeRepository.findById(id).orElseThrow();
        existing.setLabel(datos.getLabel());
        existing.setType(datos.getType());
        existing.setRequired(datos.isRequired());
        existing.setParametricTableId(datos.getParametricTableId());
        existing.setFieldSize(datos.getFieldSize());
        return attributeRepository.save(existing);
    }

    @Transactional
    public void eliminarAtributo(Long id) {
        attributeRepository.deleteById(id);
    }
}
