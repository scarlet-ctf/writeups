import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'campus.db');
const db = new Database(dbPath);

export interface User {
    id: number;
    email: string;
    password?: string;
    role: string;
}

export interface Product {
    id: number;
    name: string;
    price: string;
    description: string;
}

export interface Session {
    token: string;
    user_email: string;
    created_at: string;
}

export interface Order {
    id: number;
    order_id: string;
    customer_email: string;
    item: string;
    status: string;
    amount: string;
}

export interface Secret {
    id: number;
    key: string;
    value: string;
}

// Initialize Database
export function initDb() {
    // 1. Users Table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'student'
        )
    `);

    // 2. Products Table
    db.exec(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price TEXT NOT NULL,
            description TEXT NOT NULL
        )
    `);

    // 3. Sessions Table
    db.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_email TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Seed Users
    const userStmt = db.prepare('SELECT count(*) as count FROM users');
    const userResult = userStmt.get() as { count: number };

    if (userResult.count === 0) {
        const insert = db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)');
        insert.run('student@rutgers.edu', 'password123', 'student');
        insert.run('admin_root', 'admin_root_password_hidden', 'administrator'); // Seeding admin user for session join
        console.log("Database seeded with users.");
    }

    // Seed Products
    const prodStmt = db.prepare('SELECT count(*) as count FROM products');
    const prodResult = prodStmt.get() as { count: number };

    if (prodResult.count === 0) {
        const insert = db.prepare('INSERT INTO products (name, price, description) VALUES (?, ?, ?)');
        const products = [
            { name: "Campus Laptop Pro", price: "$899.00", description: "All-day battery life essential for long study sessions." },
            { name: "CS 101 Textbook (Digital)", price: "$45.00", description: "Introductory Computer Science principles. DRM-free." },
            { name: "Noise Cancelling Headphones", price: "$120.00", description: "Focus in any environment. Active noise cancellation." },
            { name: "Ergonomic Mechanical Keyboard", price: "$150.00", description: "Tactile switches for satisfying coding sessions." },
            { name: "Ultra-Wide Monitor 34\"", price: "$349.00", description: "Boost productivity with expansive screen real estate." },
            { name: "Smart Coffee Mug", price: "$89.99", description: "Keeps your caffeine at the perfect temperature." },
        ];

        const seed = db.transaction((items) => {
            for (const item of items) insert.run(item.name, item.price, item.description);
        });
        seed(products);
        console.log("Database seeded with products.");
    }

    // Seed Admin Session (The CTF Target)
    const sessionStmt = db.prepare('SELECT count(*) as count FROM sessions WHERE token = ?');
    const sessionResult = sessionStmt.get('admin_session_44920_x8z') as { count: number };

    // Clean up old token if exists (Migration)
    db.prepare('DELETE FROM sessions WHERE token = ?').run('admin_session_token_super_secret_8821');

    if (sessionResult.count === 0) {
        const insert = db.prepare('INSERT INTO sessions (token, user_email) VALUES (?, ?)');
        insert.run('admin_session_44920_x8z', 'admin_root');
        console.log("Database seeded with ADMIN session.");
    }

    // 4. Orders Table (for SQLi target)
    db.exec(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            item TEXT NOT NULL,
            status TEXT NOT NULL,
            amount TEXT NOT NULL
        )
    `);

    // 5. Secrets Table (contains the FLAG)
    db.exec(`
        CREATE TABLE IF NOT EXISTS secrets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT NOT NULL,
            value TEXT NOT NULL
        )
    `);

    // Seed Orders
    const orderStmt = db.prepare('SELECT count(*) as count FROM orders');
    const orderResult = orderStmt.get() as { count: number };

    if (orderResult.count === 0) {
        const insert = db.prepare('INSERT INTO orders (order_id, customer_email, item, status, amount) VALUES (?, ?, ?, ?, ?)');
        const orders = [
            { order_id: "ORD-7842", customer_email: "alice@rutgers.edu", item: "Campus Laptop Pro", status: "Shipped", amount: "$899.00" },
            { order_id: "ORD-7843", customer_email: "bob@rutgers.edu", item: "CS 101 Textbook", status: "Processing", amount: "$45.00" },
            { order_id: "ORD-7844", customer_email: "charlie@rutgers.edu", item: "Headphones", status: "Delivered", amount: "$120.00" },
            { order_id: "ORD-7845", customer_email: "diana@rutgers.edu", item: "Mechanical Keyboard", status: "Processing", amount: "$150.00" },
            { order_id: "ORD-7846", customer_email: "eve@rutgers.edu", item: "Ultra-Wide Monitor", status: "Shipped", amount: "$349.00" },
        ];

        const seedOrders = db.transaction((items) => {
            for (const o of items) insert.run(o.order_id, o.customer_email, o.item, o.status, o.amount);
        });
        seedOrders(orders);
        console.log("Database seeded with orders.");
    }

    // Seed Secrets (THE FLAG)
    const secretStmt = db.prepare('SELECT count(*) as count FROM secrets');
    const secretResult = secretStmt.get() as { count: number };

    if (secretResult.count === 0) {
        const insert = db.prepare('INSERT INTO secrets (key, value) VALUES (?, ?)');
        insert.run('master_flag', 'RUSEC{S3ss10n_H1j4ck1ng_1s_Fun_2938}');
        insert.run('db_version', '1.0.0');
        insert.run('admin_note', 'Remember to fix the search query!');
        console.log("Database seeded with secrets (FLAG).");
    }
}

export function getUser(email: string): User | undefined {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
}

export function createUser(email: string, password: string) {
    const existing = getUser(email);
    if (existing) {
        throw new Error("User already exists");
    }
    const insert = db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)');
    return insert.run(email, password, 'student');
}

export function getProducts(): Product[] {
    return db.prepare('SELECT * FROM products').all() as Product[];
}

export function createSession(token: string, email: string) {
    return db.prepare('INSERT INTO sessions (token, user_email) VALUES (?, ?)').run(token, email);
}

export function getSessions(): (Session & { user: string, role: string })[] {
    // Join with users to get role info for the leak
    return db.prepare(`
        SELECT s.token as sessionId, s.user_email as user, u.role 
        FROM sessions s
        LEFT JOIN users u ON s.user_email = u.email
    `).all() as (Session & { user: string, role: string })[];
}

export function getOrders(): Order[] {
    return db.prepare('SELECT * FROM orders').all() as Order[];
}

// VULNERABLE FUNCTION - Deliberately insecure for CTF
// This allows SQL injection through the searchTerm parameter
export function searchOrders(searchTerm: string) {
    // WARNING: This is intentionally vulnerable to SQL injection!
    // DO NOT use string concatenation like this in real applications!

    // prevent changing the database like DROP or DELETE or UPDATE
    searchTerm = searchTerm.replace(/DROP|DELETE|UPDATE/gi, '');

    // "WAF" Filter: Detect common SQL keywords followed by spaces/whitespace.
    // This forces the attacker to find alternatives like comments (/**/) or other separators.
    const wafFilter = /(UNION|SELECT|FROM|WHERE|OR|AND)\s+/gi;
    if (wafFilter.test(searchTerm)) {
        throw new Error("WAF Detection: Malicious SQL patterns detected in query string.");
    }

    const query = `SELECT order_id, customer_email, item, status, amount FROM orders WHERE order_id = '${searchTerm}' OR customer_email LIKE '%${searchTerm}%' OR item LIKE '%${searchTerm}%'`;
    try {
        return db.prepare(query).all() as Order[];
    } catch (e: any) {
        // Return error message to help attacker debug (intentional)
        return [{ error: e.message }];
    }
}

export default db;
