const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const port = 3000;

app.use(express.json());

// Connect to MySQL
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'product_db',
};
  
const pool = mysql.createPool(dbConfig);

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }

  connection.release(); // Release the connection, as we only use it for testing the connection
  console.log('Connected to the database');
});

// Handle errors if any occur during pool creation
pool.on('error', (err) => {
  console.error('Database pool error:', err);
});


app.get('/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    console.error('Error occurred while fetching product data:', error);
    res.status(500).json({ error: 'Error occurred while fetching product data' });
  }
});

app.post('/products', async (req, res) => {
  const { name, category, price, stock } = req.body;
  try {
    await pool.execute('INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)', [name, category, price, stock]);
    res.json({ message: 'Product added successfully' });
  } catch (error) {
    console.error('Error occurred while adding a product:', error);
    res.status(500).json({ error: 'Error occurred while adding a product' });
  }
});

app.put('/products/:id', async (req, res) => {
    const productId = req.params.id;
    const { name, category, price, stock } = req.body;
    try {
      // Check if the product exists before updating
      const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
  
      if (rows.length === 0) {
        res.status(404).json({ error: 'Product not found' });
        return; // Exit the route
      }
  
      // If the product exists, proceed with the update
      await pool.execute('UPDATE products SET name = ?, category = ?, price = ?, stock = ? WHERE id = ?', [name, category, price, stock, productId]);
      res.json({ message: 'Product updated successfully' });
    } catch (error) {
      console.error('Error occurred while updating a product:', error);
      res.status(500).json({ error: 'Error occurred while updating a product' });
    }
  });


app.delete('/products/:id', async (req, res) => {
    const productId = req.params.id;
    try {
      // Check if the product exists before deleting
      const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
      
      if (rows.length === 0) {
        res.status(404).json({ error: 'Product not found' });
        return; // Exit the route
      }
  
      // If the product exists, proceed with the deletion
      await pool.execute('DELETE FROM products WHERE id = ?', [productId]);
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error occurred while deleting a product:', error);
      res.status(500).json({ error: 'Error occurred while deleting a product' });
    }
  });
  

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
