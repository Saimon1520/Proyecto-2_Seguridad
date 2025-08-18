import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitiza texto para prevenir XSS
 * @param input - Texto a sanitizar
 * @returns Texto sanitizado
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  // Usar DOMPurify para sanitizar HTML
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No permitir HTML tags
    ALLOWED_ATTR: [], // No permitir atributos
    KEEP_CONTENT: true // Mantener solo el contenido de texto
  })
}

/**
 * Sanitiza HTML permitiendo solo tags seguros
 * @param input - HTML a sanitizar
 * @returns HTML sanitizado
 */
export function sanitizeHTML(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  // Permitir solo tags seguros
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'class', 'id'],
    ALLOW_DATA_ATTR: false
  })
}

/**
 * Valida y sanitiza email
 * @param email - Email a validar
 * @returns Email validado o null si es inválido
 */
export function validateEmail(email: string): string | null {
  if (typeof email !== 'string') {
    return null
  }
  
  const sanitizedEmail = sanitizeText(email.trim())
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  return emailRegex.test(sanitizedEmail) ? sanitizedEmail : null
}

/**
 * Valida y sanitiza username
 * @param username - Username a validar
 * @returns Username validado o null si es inválido
 */
export function validateUsername(username: string): string | null {
  if (typeof username !== 'string') {
    return null
  }
  
  const sanitizedUsername = sanitizeText(username.trim())
  
  // Solo permitir caracteres alfanuméricos y guiones bajos
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(sanitizedUsername)) {
    return null
  }
  
  return sanitizedUsername
}

/**
 * Valida y sanitiza nombre
 * @param name - Nombre a validar
 * @returns Nombre validado o null si es inválido
 */
export function validateName(name: string): string | null {
  if (typeof name !== 'string') {
    return null
  }
  
  const sanitizedName = sanitizeText(name.trim())
  
  // Solo permitir letras, espacios y algunos caracteres especiales
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/.test(sanitizedName)) {
    return null
  }
  
  return sanitizedName
}

/**
 * Valida y sanitiza código de producto
 * @param code - Código a validar
 * @returns Código validado o null si es inválido
 */
export function validateProductCode(code: string): string | null {
  if (typeof code !== 'string') {
    return null
  }
  
  const sanitizedCode = sanitizeText(code.trim().toUpperCase())
  
  // Solo permitir letras y números, máximo 10 caracteres
  if (!/^[A-Z0-9]{3,10}$/.test(sanitizedCode)) {
    return null
  }
  
  return sanitizedCode
}

/**
 * Valida y sanitiza precio
 * @param price - Precio a validar
 * @returns Precio validado o null si es inválido
 */
export function validatePrice(price: string | number): number | null {
  if (typeof price === 'number') {
    return price >= 0 && price <= 999999.99 ? price : null
  }
  
  if (typeof price !== 'string') {
    return null
  }
  
  const sanitizedPrice = sanitizeText(price.trim())
  const numericPrice = parseFloat(sanitizedPrice)
  
  if (isNaN(numericPrice) || numericPrice < 0 || numericPrice > 999999.99) {
    return null
  }
  
  return Math.round(numericPrice * 100) / 100 // Redondear a 2 decimales
}

/**
 * Valida y sanitiza cantidad
 * @param quantity - Cantidad a validar
 * @returns Cantidad validada o null si es inválida
 */
export function validateQuantity(quantity: string | number): number | null {
  if (typeof quantity === 'number') {
    return Number.isInteger(quantity) && quantity >= 0 && quantity <= 999999 ? quantity : null
  }
  
  if (typeof quantity !== 'string') {
    return null
  }
  
  const sanitizedQuantity = sanitizeText(quantity.trim())
  const numericQuantity = parseInt(sanitizedQuantity, 10)
  
  if (isNaN(numericQuantity) || !Number.isInteger(numericQuantity) || numericQuantity < 0 || numericQuantity > 999999) {
    return null
  }
  
  return numericQuantity
}

/**
 * Escapa caracteres especiales para prevenir inyección en logs
 * @param input - Texto a escapar
 * @returns Texto escapado
 */
export function escapeForLog(input: string): string {
  if (typeof input !== 'string') {
    return String(input)
  }
  
  return input
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
}

/**
 * Genera un token CSRF aleatorio
 * @returns Token CSRF
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Valida token CSRF
 * @param token - Token a validar
 * @param expectedToken - Token esperado
 * @returns true si el token es válido
 */
export function validateCSRFToken(token: string, expectedToken: string): boolean {
  if (typeof token !== 'string' || typeof expectedToken !== 'string') {
    return false
  }
  
  // Comparación segura de strings
  return token.length === expectedToken.length && 
         token === expectedToken
}
