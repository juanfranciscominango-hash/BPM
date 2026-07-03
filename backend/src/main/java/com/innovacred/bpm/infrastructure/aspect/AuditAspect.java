package com.innovacred.bpm.infrastructure.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.innovacred.bpm.domain.entity.AuditLog;
import com.innovacred.bpm.infrastructure.adapter.persistence.AuditLogRepository;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityManager;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Transient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditLogRepository auditLogRepository;
    private final EntityManager entityManager;

    @Around("@annotation(auditable)")
    public Object audit(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        String username = "Sistema";
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            username = auth.getName();
        } else {
            // Resolver usuario de los argumentos (útil para login)
            for (Object arg : joinPoint.getArgs()) {
                if (arg instanceof Map) {
                    Map<?, ?> map = (Map<?, ?>) arg;
                    if (map.containsKey("email")) {
                        username = String.valueOf(map.get("email"));
                    } else if (map.containsKey("username")) {
                        username = String.valueOf(map.get("username"));
                    }
                }
            }
        }

        String ipAddress = "0.0.0.0";
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            ipAddress = attributes.getRequest().getRemoteAddr();
        }

        Object entityArg = null;
        Object entityId = null;
        Map<String, Object> diffMap = new HashMap<>();
        boolean isUpdate = false;

        // Buscar argumento anotado con @Entity
        for (Object arg : joinPoint.getArgs()) {
            if (arg != null && arg.getClass().isAnnotationPresent(Entity.class)) {
                entityArg = arg;
                entityId = getEntityId(arg);
                if (entityId != null && (entityId instanceof Number ? ((Number) entityId).longValue() != 0 : true)) {
                    isUpdate = true;
                }
                break;
            }
        }

        String finalAccion = auditable.accion();

        if (isUpdate) {
            // Si tiene ID, es una modificación
            if (finalAccion.startsWith("CREAR_") || finalAccion.startsWith("REGISTRAR_") || finalAccion.equals("GUARDAR_USUARIO") || finalAccion.equals("GUARDAR_ROL")) {
                finalAccion = finalAccion.replace("CREAR_", "MODIFICAR_").replace("REGISTRAR_", "MODIFICAR_").replace("GUARDAR_", "MODIFICAR_");
            }
            try {
                // Obtener estado actual de la BD
                Object oldEntity = entityManager.find(entityArg.getClass(), entityId);
                if (oldEntity != null) {
                    Map<String, Map<String, Object>> camposModificados = compareEntities(oldEntity, entityArg);
                    if (!camposModificados.isEmpty()) {
                        diffMap.put("campos_modificados", camposModificados);
                    }
                }
            } catch (Exception ex) {
                log.warn("Error comparing entity states for audit: {}", ex.getMessage());
            }
        } else {
            // Si no tiene ID, es una creación
            if (finalAccion.startsWith("MODIFICAR_") || finalAccion.startsWith("ACTUALIZAR_") || finalAccion.equals("GUARDAR_USUARIO") || finalAccion.equals("GUARDAR_ROL")) {
                finalAccion = finalAccion.replace("MODIFICAR_", "CREAR_").replace("ACTUALIZAR_", "CREAR_").replace("GUARDAR_", "CREAR_");
            }
            if (entityArg != null) {
                diffMap.put("payload_creacion", getEntityDetailsMap(entityArg));
            }
        }

        Object result = null;
        String estado = "EXITOSO";
        try {
            result = joinPoint.proceed();
            
            // Si fue creación y no teníamos el ID, lo obtenemos ahora del resultado
            if (entityId == null && result != null && result.getClass().isAnnotationPresent(Entity.class)) {
                entityId = getEntityId(result);
            }
        } catch (Throwable t) {
            estado = "FALLIDO";
            diffMap.put("error", t.getMessage());
            throw t;
        } finally {
            try {
                ObjectMapper mapper = new ObjectMapper();
                AuditLog logEntry = AuditLog.builder()
                        .fechaHora(LocalDateTime.now())
                        .usuario(username)
                        .accion(finalAccion)
                        .nombreEntidad(auditable.entidad().isEmpty() ? (entityArg != null ? entityArg.getClass().getSimpleName() : "") : auditable.entidad())
                        .idEntidad(entityId != null ? String.valueOf(entityId) : "")
                        .direccionIp(ipAddress)
                        .detalles(mapper.writeValueAsString(diffMap))
                        .estado(estado)
                        .build();
                
                auditLogRepository.save(logEntry);
            } catch (Exception ex) {
                log.error("Could not write audit log entry: {}", ex.getMessage());
            }
        }
        
        return result;
    }

    private Object getEntityId(Object entity) {
        if (entity == null) return null;
        try {
            for (java.lang.reflect.Field field : entity.getClass().getDeclaredFields()) {
                if (field.isAnnotationPresent(jakarta.persistence.Id.class)) {
                    field.setAccessible(true);
                    return field.get(entity);
                }
            }
            java.lang.reflect.Method getIdMethod = entity.getClass().getMethod("getId");
            return getIdMethod.invoke(entity);
        } catch (Exception e) {
            return null;
        }
    }

    private Map<String, Map<String, Object>> compareEntities(Object oldObj, Object newObj) {
        Map<String, Map<String, Object>> diff = new HashMap<>();
        try {
            for (java.lang.reflect.Field field : oldObj.getClass().getDeclaredFields()) {
                if (java.lang.reflect.Modifier.isStatic(field.getModifiers()) || 
                    field.isAnnotationPresent(ManyToMany.class) || 
                    field.isAnnotationPresent(OneToMany.class) || 
                    field.isAnnotationPresent(Transient.class)) {
                    continue;
                }
                
                field.setAccessible(true);
                Object oldVal = field.get(oldObj);
                Object newVal = field.get(newObj);
                
                if (field.getName().toLowerCase().contains("password") || field.getName().toLowerCase().contains("clave")) {
                    if (oldVal != null && !oldVal.equals(newVal)) {
                        Map<String, Object> values = new HashMap<>();
                        values.put("anterior", "[PROTEGIDO]");
                        values.put("nuevo", "[MODIFICADO]");
                        diff.put(field.getName(), values);
                    }
                    continue;
                }
                
                if (oldVal == null && newVal != null) {
                    Map<String, Object> values = new HashMap<>();
                    values.put("anterior", null);
                    values.put("nuevo", newVal);
                    diff.put(field.getName(), values);
                } else if (oldVal != null && !oldVal.equals(newVal)) {
                    Map<String, Object> values = new HashMap<>();
                    values.put("anterior", oldVal);
                    values.put("nuevo", newVal);
                    diff.put(field.getName(), values);
                }
            }
        } catch (Exception e) {
            log.warn("Error comparing fields: {}", e.getMessage());
        }
        return diff;
    }

    private Map<String, Object> getEntityDetailsMap(Object obj) {
        Map<String, Object> map = new HashMap<>();
        try {
            for (java.lang.reflect.Field field : obj.getClass().getDeclaredFields()) {
                if (java.lang.reflect.Modifier.isStatic(field.getModifiers()) || 
                    field.isAnnotationPresent(ManyToMany.class) || 
                    field.isAnnotationPresent(OneToMany.class)) {
                    continue;
                }
                field.setAccessible(true);
                Object val = field.get(obj);
                
                if (field.getName().toLowerCase().contains("password") || field.getName().toLowerCase().contains("clave")) {
                    map.put(field.getName(), "[PROTEGIDO]");
                } else {
                    map.put(field.getName(), val);
                }
            }
        } catch (Exception e) {
            // ignore
        }
        return map;
    }
}
