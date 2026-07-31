/**
 * Constantes de la aplicación - Variables de texto reutilizables
 * Organizadas por jerarquía para mantener buenas prácticas
 *
 * USO RECOMENDADO:
 *
 * // Importación completa
 * import { CONSTANTES } from '../constantes';
 *
 * // Importación específica
 * import { API, UI, MENSAJES } from '../constantes';
 *
 * // Ejemplos de uso:
 * const headers = { 'Authorization': CONSTANTES.API.PREFIJO_BEARER + token };
 * const errorMessage = CONSTANTES.MENSAJES.ERROR.GENERIC;
 * const buttonText = CONSTANTES.UI.SAVE;
 *
 * // Uso de funciones helper:
 * import { CONSTANTES_HELPERS } from '../constantes';
 * const isValid = CONSTANTES_HELPERS.isValidFileSize(file.size);
 */

export const CONSTANTES = {
  // ==========================================
  // API - Constantes relacionadas con APIs
  // ==========================================
  API: {
    PREFIJO_BEARER: 'Bearer ',
    CONTENT_TYPE_JSON: 'application/json',
    CONTENT_TYPE_FORM: 'application/x-www-form-urlencoded',
    TIMEOUT_DEFAULT: 30000, // 30 segundos
    RETRY_ATTEMPTS: 3,
    CACHE_DURATION: 300000, // 5 minutos en ms
  },

  // ==========================================
  // HTTP - Códigos de estado HTTP
  // ==========================================
  HTTP: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
  },

  // ==========================================
  // UI - Elementos de interfaz de usuario
  // ==========================================
  UI: {
    LOADING: 'Cargando...',
    SAVE: 'Guardar',
    CANCEL: 'Cancelar',
    EDIT: 'Editar',
    DELETE: 'Eliminar',
    CONFIRM: 'Confirmar',
    CLOSE: 'Cerrar',
    SEARCH: 'Buscar',
    FILTER: 'Filtrar',
    REFRESH: 'Actualizar',
    BACK: 'Volver',
    NEXT: 'Siguiente',
    PREVIOUS: 'Anterior',
    YES: 'Sí',
    NO: 'No',
    ACCEPT: 'Aceptar',
    REJECT: 'Rechazar',
  },

  // ==========================================
  // MENSAJES - Mensajes para el usuario
  // ==========================================
  MENSAJES: {
    // Éxito
    SUCCESS: {
      SAVE: 'Datos guardados correctamente',
      DELETE: 'Registro eliminado correctamente',
      UPDATE: 'Datos actualizados correctamente',
      CREATE: 'Registro creado correctamente',
    },

    // Error
    ERROR: {
      GENERIC: 'Ha ocurrido un error inesperado',
      NETWORK: 'Error de conexión. Verifique su conexión a internet',
      UNAUTHORIZED: 'No tiene permisos para realizar esta acción',
      NOT_FOUND: 'El recurso solicitado no fue encontrado',
      VALIDATION: 'Por favor, corrija los errores del formulario',
      SERVER: 'Error del servidor. Intente nuevamente más tarde',
    },

    // Confirmación
    CONFIRM: {
      DELETE: '¿Está seguro de que desea eliminar este registro?',
      SAVE: '¿Desea guardar los cambios?',
      CANCEL: '¿Está seguro de que desea cancelar? Los cambios no guardados se perderán',
    },

    // Información
    INFO: {
      NO_DATA: 'No hay datos para mostrar',
      LOADING: 'Cargando información...',
      SEARCH_NO_RESULTS: 'No se encontraron resultados para la búsqueda',
    },
  },

  // ==========================================
  // VALIDATION - Mensajes de validación
  // ==========================================
  VALIDATION: {
    REQUIRED: 'Este campo es obligatorio',
    EMAIL: 'Ingrese un correo electrónico válido',
    MIN_LENGTH: (min: number) => `Debe tener al menos ${min} caracteres`,
    MAX_LENGTH: (max: number) => `No puede tener más de ${max} caracteres`,
    PATTERN: 'El formato no es válido',
    NUMBER: 'Debe ser un número válido',
    POSITIVE_NUMBER: 'Debe ser un número positivo',
    DATE: 'Ingrese una fecha válida',
    PASSWORD_STRENGTH: 'La contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula y un número',
    PASSWORD_MATCH: 'Las contraseñas no coinciden',
  },

  // ==========================================
  // STORAGE - Keys para localStorage/sessionStorage
  // ==========================================
  STORAGE: {
    TOKEN: 'auth_token',
    USER: 'user_data',
    THEME: 'app_theme',
    LANGUAGE: 'app_language',
    SETTINGS: 'user_settings',
    SESSION_ID: 'session_id',
  },

  // ==========================================
  // ROUTES - Rutas de la aplicación
  // ==========================================
  ROUTES: {
    HOME: '/dashboard',
    LOGIN: '/login',
    PROFILE: '/profile',
    SETTINGS: '/settings',
    USERS: '/usuarios',
    CONFIG: '/configuracion',
  },

  // ==========================================
  // PAGINATION - Configuración de paginación
  // ==========================================
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
    MAX_PAGES_DISPLAY: 5,
  },

  // ==========================================
  // DATE - Formatos de fecha
  // ==========================================
  DATE: {
    FORMAT_SHORT: 'DD/MM/YYYY',
    FORMAT_LONG: 'DD/MM/YYYY HH:mm:ss',
    FORMAT_ISO: 'YYYY-MM-DDTHH:mm:ssZ',
    LOCALE: 'es-ES',
  },

  // ==========================================
  // REGEX - Expresiones regulares comunes
  // ==========================================
  REGEX: {
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    PHONE: /^[\+]?[1-9][\d]{0,15}$/,
    NUMERIC: /^\d+$/,
    ALPHABETIC: /^[a-zA-Z\s]+$/,
    ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
  },

  // ==========================================
  // THEME - Configuración de temas
  // ==========================================
  THEME: {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto',
  },

  // ==========================================
  // FILE - Configuración de archivos
  // ==========================================
  FILE: {
    MAX_SIZE_MB: 10,
    ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    IMAGE_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    DOCUMENT_EXTENSIONS: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
  },

  // ==========================================
  // SCROLL - Configuración del scroll to top
  // ==========================================
  SCROLL: {
    THRESHOLD_SHOW: 300, // Mostrar botón después de 300px
    SCROLL_DURATION: 500, // Duración del smooth scroll en ms
    SCROLL_OFFSET: 0, // Offset adicional para el scroll
  },
} as const;
export const CONSTANTES_HELPERS = {
  // Función para obtener mensaje de error HTTP
  getHttpErrorMessage: (status: number): string => {
    switch (status) {
      case CONSTANTES.HTTP.UNAUTHORIZED:
        return CONSTANTES.MENSAJES.ERROR.UNAUTHORIZED;
      case CONSTANTES.HTTP.NOT_FOUND:
        return CONSTANTES.MENSAJES.ERROR.NOT_FOUND;
      case CONSTANTES.HTTP.INTERNAL_SERVER_ERROR:
        return CONSTANTES.MENSAJES.ERROR.SERVER;
      default:
        return CONSTANTES.MENSAJES.ERROR.GENERIC;
    }
  },

  // Función para validar tamaño de archivo
  isValidFileSize: (fileSize: number, maxSizeMB: number = CONSTANTES.FILE.MAX_SIZE_MB): boolean => {
    return fileSize <= (maxSizeMB * 1024 * 1024);
  },

  // Función para validar extensión de archivo
  isValidFileExtension: (fileName: string, allowedExtensions: readonly string[] = CONSTANTES.FILE.ALLOWED_EXTENSIONS): boolean => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? allowedExtensions.includes(extension) : false;
  },
};

// ==========================================
// EXPORTS INDIVIDUALES - Para importaciones específicas
// ==========================================
export const {
  API,
  HTTP,
  UI,
  MENSAJES,
  VALIDATION,
  STORAGE,
  ROUTES,
  PAGINATION,
  DATE,
  REGEX,
  THEME,
  FILE,
  SCROLL,
} = CONSTANTES;