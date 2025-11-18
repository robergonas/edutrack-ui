export const environment = {
  production: false,
  apiUrl: 'https://localhost:7064/api',
  apiTimeout: 30000,
  enableCaptcha: false,

  // Configuración de autenticación
  auth: {
    tokenKey: 'edutrack_token',
    refreshTokenKey: 'edutrack_refresh_token',
    userKey: 'edutrack_user',
    rememberUserKey: 'edutrack_remember_user',
  },

  // Configuración de reCAPTCHA
  recaptcha: {
    siteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', // Test key - reemplazar en producción
  },

  // Rutas de API
  endpoints: {
    login: '/auth/login',
    logout: '/auth/logout',
    refreshToken: '/auth/refresh-token',
    forgotPassword: '/auth/forgot-password',
    changePassword: '/auth/change-password',
  },
};
