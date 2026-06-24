-- Script para insertar el menú del "Ejecutor de Pantallas" manualmente
-- si la base de datos ya fue inicializada.

DO $$
DECLARE
    plataforma_id BIGINT;
BEGIN
    -- Obtener el ID del menú padre "Plataforma"
    SELECT id INTO plataforma_id FROM sys_menus WHERE title = 'Plataforma' LIMIT 1;
    
    IF plataforma_id IS NOT NULL THEN
        -- Verificar si ya existe para evitar duplicados
        IF NOT EXISTS (SELECT 1 FROM sys_menus WHERE route = '/plataforma/ejecutor-pantallas') THEN
            INSERT INTO sys_menus (active, icon, permission_code, route, sort_order, title, parent_id)
            VALUES (true, 'bi bi-play-circle', 'ACCESO_PANTALLAS', '/plataforma/ejecutor-pantallas', 10, 'Ejecutor Pantallas', plataforma_id);
            RAISE NOTICE 'Menú insertado correctamente.';
        ELSE
            RAISE NOTICE 'El menú ya existe.';
        END IF;
    ELSE
        RAISE NOTICE 'No se encontró el menú padre "Plataforma".';
    END IF;
END $$;
