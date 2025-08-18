const sqlite3 = require('sqlite3').verbose();

const dbPath = process.env.NODE_ENV === 'production' 
    ? './payments.db' 
    : './payments.db';

class Database {
    constructor() {
        this.db = new sqlite3.Database(dbPath);
        this.initializeTables();
    }

    async initializeTables() {
        const queries = [
            `CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                image_url TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        for (const query of queries) {
            await this.db.run(query);
        }
    }

    async addProduct(product) {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO products (name, description, price, image_url) VALUES (?, ?, ?, ?)`;
            this.db.run(query, [product.name, product.description, product.price, product.image_url], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }

    async getAllProducts() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM products ORDER BY created_at DESC', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    async deleteProduct(id) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM products WHERE id = ?', [id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    async updateProduct(id, updates) {
        const keys = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = keys.map(key => `${key} = ?`).join(', ');
        
        return new Promise((resolve, reject) => {
            this.db.run(
                `UPDATE products SET ${setClause} WHERE id = ?`,
                [...values, id],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }
}

module.exports = Database;
