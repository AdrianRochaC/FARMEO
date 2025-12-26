#!/usr/bin/env node

/**
 * Script de Verificación Automática para Dongee
 * 
 * Este script verifica que tu aplicación funcione correctamente
 * después del despliegue en Dongee.
 * 
 * Uso:
 *   node verificar-dongee.js
 *   node verificar-dongee.js --url https://farmeoa.com
 */

const https = require('https');
const http = require('http');

// Configuración
const args = process.argv.slice(2);
const urlArg = args.find(arg => arg.startsWith('--url='));
const BASE_URL = urlArg ? urlArg.split('=')[1] : 'https://farmeoa.com';

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

// Función para hacer peticiones HTTP/HTTPS
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const startTime = Date.now();

        protocol.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: data,
                    responseTime: responseTime
                });
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Función para imprimir resultados
function printResult(test, passed, message, details = '') {
    const icon = passed ? '✅' : '❌';
    const color = passed ? colors.green : colors.red;
    console.log(`${icon} ${color}${test}${colors.reset}`);
    if (message) {
        console.log(`   ${message}`);
    }
    if (details) {
        console.log(`   ${colors.cyan}${details}${colors.reset}`);
    }
    console.log('');
}

// Función para imprimir encabezado
function printHeader(title) {
    console.log('');
    console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.blue}${title}${colors.reset}`);
    console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
    console.log('');
}

// Tests
async function runTests() {
    console.log(`${colors.cyan}🔍 Iniciando verificación de ${BASE_URL}${colors.reset}`);
    console.log('');

    let totalTests = 0;
    let passedTests = 0;

    // ========================================
    // 1. VERIFICACIÓN DEL FRONTEND
    // ========================================
    printHeader('1. VERIFICACIÓN DEL FRONTEND');

    // Test 1.1: Página principal carga
    totalTests++;
    try {
        const response = await makeRequest(BASE_URL);
        const passed = response.statusCode === 200;
        if (passed) passedTests++;

        printResult(
            'Página principal carga',
            passed,
            passed ? 'La página principal responde correctamente' : `Error: código ${response.statusCode}`,
            `Tiempo de respuesta: ${response.responseTime}ms`
        );
    } catch (error) {
        printResult(
            'Página principal carga',
            false,
            `Error: ${error.message}`
        );
    }

    // Test 1.2: Archivos estáticos (CSS, JS)
    totalTests++;
    try {
        const response = await makeRequest(BASE_URL);
        const hasJS = response.data.includes('.js');
        const hasCSS = response.data.includes('.css');
        const passed = hasJS && hasCSS;
        if (passed) passedTests++;

        printResult(
            'Archivos estáticos (CSS, JS)',
            passed,
            passed ? 'Los archivos estáticos están referenciados' : 'No se encontraron referencias a archivos estáticos',
            `JS: ${hasJS ? 'Sí' : 'No'}, CSS: ${hasCSS ? 'Sí' : 'No'}`
        );
    } catch (error) {
        printResult(
            'Archivos estáticos (CSS, JS)',
            false,
            `Error: ${error.message}`
        );
    }

    // ========================================
    // 2. VERIFICACIÓN DEL BACKEND
    // ========================================
    printHeader('2. VERIFICACIÓN DEL BACKEND');

    // Test 2.1: Health check
    totalTests++;
    try {
        const response = await makeRequest(`${BASE_URL}/api/health`);
        const passed = response.statusCode === 200;
        if (passed) passedTests++;

        let data;
        try {
            data = JSON.parse(response.data);
        } catch (e) {
            data = null;
        }

        printResult(
            'Health check del backend',
            passed,
            passed ? 'El backend responde correctamente' : `Error: código ${response.statusCode}`,
            data ? `Respuesta: ${JSON.stringify(data)}` : `Tiempo: ${response.responseTime}ms`
        );
    } catch (error) {
        printResult(
            'Health check del backend',
            false,
            `Error: ${error.message}`,
            'Verifica que el backend esté corriendo y accesible'
        );
    }

    // Test 2.2: Test de base de datos
    totalTests++;
    try {
        const response = await makeRequest(`${BASE_URL}/api/test-db`);
        const passed = response.statusCode === 200;
        if (passed) passedTests++;

        let data;
        try {
            data = JSON.parse(response.data);
        } catch (e) {
            data = null;
        }

        printResult(
            'Conexión a base de datos',
            passed,
            passed ? 'La base de datos está conectada' : `Error: código ${response.statusCode}`,
            data ? `Respuesta: ${JSON.stringify(data)}` : ''
        );
    } catch (error) {
        printResult(
            'Conexión a base de datos',
            false,
            `Error: ${error.message}`,
            'Verifica las credenciales de la base de datos en .env'
        );
    }

    // ========================================
    // 3. VERIFICACIÓN DE APIS
    // ========================================
    printHeader('3. VERIFICACIÓN DE APIS');

    // Test 3.1: API de autenticación (debe devolver error sin credenciales)
    totalTests++;
    try {
        const response = await makeRequest(`${BASE_URL}/api/auth/me`);
        // Esperamos 401 porque no tenemos token
        const passed = response.statusCode === 401 || response.statusCode === 403;
        if (passed) passedTests++;

        printResult(
            'API de autenticación',
            passed,
            passed ? 'La API de autenticación está activa' : 'La API de autenticación no responde como se esperaba',
            `Código: ${response.statusCode} (esperado: 401 o 403)`
        );
    } catch (error) {
        printResult(
            'API de autenticación',
            false,
            `Error: ${error.message}`
        );
    }

    // ========================================
    // 4. VERIFICACIÓN DE RENDIMIENTO
    // ========================================
    printHeader('4. VERIFICACIÓN DE RENDIMIENTO');

    // Test 4.1: Tiempo de respuesta
    totalTests++;
    try {
        const response = await makeRequest(BASE_URL);
        const passed = response.responseTime < 3000; // Menos de 3 segundos
        if (passed) passedTests++;

        printResult(
            'Tiempo de respuesta',
            passed,
            passed ? 'El tiempo de respuesta es aceptable' : 'El tiempo de respuesta es lento',
            `Tiempo: ${response.responseTime}ms (objetivo: < 3000ms)`
        );
    } catch (error) {
        printResult(
            'Tiempo de respuesta',
            false,
            `Error: ${error.message}`
        );
    }

    // ========================================
    // 5. VERIFICACIÓN DE SEGURIDAD
    // ========================================
    printHeader('5. VERIFICACIÓN DE SEGURIDAD');

    // Test 5.1: HTTPS
    totalTests++;
    const isHTTPS = BASE_URL.startsWith('https://');
    if (isHTTPS) passedTests++;

    printResult(
        'HTTPS habilitado',
        isHTTPS,
        isHTTPS ? 'El sitio usa HTTPS' : 'El sitio NO usa HTTPS (recomendado)',
        isHTTPS ? 'Conexión segura' : 'Considera habilitar SSL/TLS'
    );

    // Test 5.2: Headers de seguridad
    totalTests++;
    try {
        const response = await makeRequest(BASE_URL);
        const hasSecurityHeaders =
            response.headers['x-content-type-options'] ||
            response.headers['x-frame-options'] ||
            response.headers['strict-transport-security'];

        if (hasSecurityHeaders) passedTests++;

        printResult(
            'Headers de seguridad',
            hasSecurityHeaders,
            hasSecurityHeaders ? 'Algunos headers de seguridad están presentes' : 'No se encontraron headers de seguridad',
            hasSecurityHeaders ? 'Buenas prácticas de seguridad' : 'Considera agregar headers de seguridad'
        );
    } catch (error) {
        printResult(
            'Headers de seguridad',
            false,
            `Error: ${error.message}`
        );
    }

    // ========================================
    // RESUMEN FINAL
    // ========================================
    printHeader('RESUMEN FINAL');

    const percentage = Math.round((passedTests / totalTests) * 100);
    const color = percentage >= 80 ? colors.green : percentage >= 50 ? colors.yellow : colors.red;

    console.log(`${color}Tests pasados: ${passedTests}/${totalTests} (${percentage}%)${colors.reset}`);
    console.log('');

    if (percentage >= 80) {
        console.log(`${colors.green}✅ ¡Excelente! Tu aplicación está funcionando correctamente.${colors.reset}`);
    } else if (percentage >= 50) {
        console.log(`${colors.yellow}⚠️  Tu aplicación funciona parcialmente. Revisa los errores.${colors.reset}`);
    } else {
        console.log(`${colors.red}❌ Tu aplicación tiene problemas. Revisa la guía de verificación.${colors.reset}`);
    }

    console.log('');
    console.log(`${colors.cyan}📖 Para más detalles, consulta: VERIFICACION-DONGEE.md${colors.reset}`);
    console.log('');
}

// Ejecutar tests
runTests().catch(error => {
    console.error(`${colors.red}Error fatal: ${error.message}${colors.reset}`);
    process.exit(1);
});
