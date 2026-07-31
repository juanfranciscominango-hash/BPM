-- ============================================================
-- Script de configuración inicial - Mensajería Automática BPM
-- Ejecutar en la base de datos del proyecto BPM
-- ============================================================

-- 1. Crear el Rol RESPONSABLE_NOTIFICACIONES (si no existe)
INSERT INTO "SEC_ROLE" (name)
SELECT 'RESPONSABLE_NOTIFICACIONES'
WHERE NOT EXISTS (
    SELECT 1 FROM "SEC_ROLE" WHERE name = 'RESPONSABLE_NOTIFICACIONES'
);

-- 2. Asignar el rol a un usuario existente (ajustar el username según corresponda)
-- IMPORTANTE: Reemplaza 'usuario@cooperativa.com' con el correo real del responsable
INSERT INTO "SEC_USER_ROLE" (user_id, role_id)
SELECT u.id, r.id
FROM "SEC_USER" u, "SEC_ROLE" r
WHERE u.username = 'usuario@cooperativa.com'
  AND r.name = 'RESPONSABLE_NOTIFICACIONES'
  AND NOT EXISTS (
      SELECT 1 FROM "SEC_USER_ROLE" ur
      WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- 3. La tabla camp_mensajeria es creada automáticamente por Hibernate (JPA).
--    Si prefieres crearla manualmente, aquí está la DDL:
CREATE TABLE IF NOT EXISTS camp_mensajeria (
    id                      BIGSERIAL PRIMARY KEY,
    nombre                  VARCHAR(150) NOT NULL,
    canal                   VARCHAR(20)  NOT NULL,
    asunto_email            VARCHAR(200),
    cuerpo_mensaje          TEXT NOT NULL,

    -- Filtros de segmentación
    filtro_estado_proceso   VARCHAR(50),
    filtro_producto         VARCHAR(100),
    filtro_edad_desde       INTEGER,
    filtro_edad_hasta       INTEGER,
    filtro_monto_minimo     DOUBLE PRECISION,
    filtro_agencia          VARCHAR(100),

    -- Resultado extracción (preview)
    total_destinatarios     INTEGER,
    total_email             INTEGER,
    total_sms               INTEGER,
    total_portal            INTEGER,

    -- Métricas post-envío
    enviados_exitosos       INTEGER,
    rebotes                 INTEGER,
    abiertos                INTEGER,

    -- Control
    estado                  VARCHAR(30) NOT NULL DEFAULT 'BORRADOR',
    responsable             VARCHAR(100),
    process_instance_id     VARCHAR(100),
    fecha_creacion          TIMESTAMP,
    fecha_envio             TIMESTAMP,
    fecha_cierre            TIMESTAMP
);

-- 4. Verificar que todo quedó correcto
SELECT id, name FROM "SEC_ROLE" WHERE name = 'RESPONSABLE_NOTIFICACIONES';
