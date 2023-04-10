const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');

// Create a connection to the Sakila database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'fvtT55m#6#I*',
  database: 'sakila'
});

// Dynamically generate table links and metrics
connection.query("SHOW TABLES", function (err, rows, fields) {
  if (err) throw err;

  // Generate the HTML for the table links
  let tableLinksHtml = "";
  rows.forEach(function(row) {
    let tableName = row['Tables_in_sakila'];
    tableLinksHtml += `<li><a href="/${tableName}">${tableName}</a></li>`;
  });

  // Generate the HTML for the metrics
  let metricsHtml = `<p>Total tables: ${rows.length}</p>`;

  // Serve the HTML file with the generated content
  let indexHtml = `
    <html>
      <head>
        <title>Sakila API</title>
      </head>
      <body>
        <h1>Sakila API</h1>
        <ul>
          ${tableLinksHtml}
        </ul>
        ${metricsHtml}
      </body>
    </html>
  `;
  app.get('/', (req, res) => {
    res.send(indexHtml);
  });

  // Create a route for each table
  rows.forEach(function(row) {
    let tableName = row['Tables_in_sakila'];
    app.get(`/${tableName}`, (req, res) => {
      connection.query(`SELECT * FROM ${tableName}`, (err, results, fields) => {
        if (err) throw err;
        res.json(results);
      });
    });
  });
});

// Define API endpoint to retrieve number of films and customers
app.get('/dashboard', (req, res) => {
  let filmsCount = 0;
  let customersCount = 0;

  // Retrieve number of films
  connection.query('SELECT COUNT(*) AS count FROM film', (err, results, fields) => {
    if (err) {
      console.error('Error retrieving films count:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    filmsCount = results[0].count;

    // Retrieve number of customers
    connection.query('SELECT COUNT(*) AS count FROM customer', (err, results, fields) => {
      if (err) {
        console.error('Error retrieving customers count:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      customersCount = results[0].count;

      // Render dashboard template with counts
      res.render('dashboard', { filmsCount, customersCount });
    });
  });
});


// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
