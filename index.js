// const express = require('express');
// const path = require('path');
// const sqlite3 = require('sqlite3');
// const { open } = require('sqlite');

// const dbpath1 = path.join(__dirname, "customers.db");

// const app = express();
// const cors = require('cors');

// app.use(cors());
// app.use(express.json());
// let db = null;

// const PORT = process.env.PORT || 3000;
// const initialize = async () => {
//   try {
//     db = await open({
//       filename: dbpath1,
//       driver: sqlite3.Database,
//     });


//     app.listen(PORT, () => {
//       console.log(`Server is running on http://localhost:${PORT}`);
//     });
//   } catch (e) {
//     console.log(`Error message ${e.message}`);
//     process.exit(1);
//   }
// };
// initialize();



// app.post("/customers", async (request, response) => {
//     const { first_name, last_name, phone, email, address} = request.body;
   
//       const insertImageQuery = `
//           INSERT INTO customers (first_name, last_name, phone, email, address)
//           VALUES (
//             '${first_name}',
//             ${last_name},
//             '${phone}',
//             '${email}',
//             '${address}'
//           )
//         `;
//       await db.run(insertImageQuery);
//     response.send({ message: 'Customer created successfully', customerId: this.lastID });
//   });

//   app.get("/all-customers", async (request, response) => {
//     const { name, city } = request.query;
//     let query = `SELECT * FROM customers WHERE 1=1`;

//     if (name) {
//         query += ` AND (first_name LIKE '%${name}%' OR last_name LIKE '%${name}%')`;
//     }

//     if (city) {
//         query += ` AND address LIKE '%${city}%'`;
//     }

//     try {
//         const everything = await db.all(query);
//         response.send(everything);
//     } catch (err) {
//         response.status(500).send({ error: 'Failed to fetch customers' });
//     }
// });


// app.get('/api/customers/:id', async (req, res) => {
//     const {id} = req.params 
//     const query = `SELECT * FROM customers WHERE id = ${id}`;
//     const details = await db.get(query) 
//     res.send(details)
// });

// app.put('/customers/:id', async (request, response) => {
//     const { id } = request.params;
//     const { first_name, last_name, phone, email, address} = request.body;
  
//     const updateUserQuery = `
//       UPDATE customers
//       SET first_name = '${first_name}',last_name='${last_name}',phone='${phone}',email='${email}',address='${address}'
//       WHERE id = ${id};
//     `;
//     await db.run(updateUserQuery);
//     response.send("Customer updated successfully");
//   });

// app.delete('/customers/:id', async (request, response) => {
//     const { id } = request.params;

//     const query = `DELETE FROM customers WHERE id = ${id}`;
//     await db.run(query);
//     response.send("Customer delete successfully");
// });


const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const dbpath1 = path.join(__dirname, "customers.db");

const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
let db = null;

const PORT = process.env.PORT || 3000;
const initialize = async () => {
  try {
    db = await open({
      filename: dbpath1,
      driver: sqlite3.Database,
    });

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (e) {
    console.log(`Error message ${e.message}`);
    process.exit(1);
  }
};
initialize();

// Customer routes
app.post("/customers", async (request, response) => {
  const { first_name, last_name, phone, email, address } = request.body;

  const insertCustomerQuery = `
    INSERT INTO customers (first_name, last_name, phone, email, address)
    VALUES (?, ?, ?, ?, ?)
  `;
  const result = await db.run(insertCustomerQuery, [first_name, last_name, phone, email, address]);
  response.send({ message: 'Customer created successfully', customerId: result.lastID });
});

// app.get("/all-customers", async (request, response) => {
//   const { name, city } = request.query;
//   let query = `SELECT * FROM customers WHERE 1=1`;

//   if (name) {
//     query += ` AND (first_name LIKE '%${name}%' OR last_name LIKE '%${name}%')`;
//   }

//   if (city) {
//     query += ` AND address LIKE '%${city}%'`;
//   }

//   try {
//     const customers = await db.all(query);
//     response.send(customers);
//   } catch (err) {
//     response.status(500).send({ error: 'Failed to fetch customers' });
//   }
// });
app.get("/all-customers", async (request, response) => {
  const { name, city, page = 0, limit = 5 } = request.query;
  let query = `SELECT * FROM customers WHERE 1=1`;
  let countQuery = `SELECT COUNT(*) AS count FROM customers WHERE 1=1`;

  // Apply filters if provided
  if (name) {
    query += ` AND (first_name LIKE '%${name}%' OR last_name LIKE '%${name}%')`;
    countQuery += ` AND (first_name LIKE '%${name}%' OR last_name LIKE '%${name}%')`;
  }

  if (city) {
    query += ` AND address LIKE '%${city}%'`;
    countQuery += ` AND address LIKE '%${city}%'`;
  }

  // Add pagination
  query += ` LIMIT ? OFFSET ?`;

  try {
    const [customers, countResult] = await Promise.all([
      db.all(query, [parseInt(limit), parseInt(page) * parseInt(limit)]),
      db.get(countQuery)
    ]);

    response.send({
      customers,
      total: countResult.count,
    });
  } catch (err) {
    response.status(500).send({ error: 'Failed to fetch customers' });
  }
});

app.get('/customers/:id', async (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM customers WHERE id = ?`;
  const customer = await db.get(query, [id]);
  res.send(customer);
});

app.put('/customers/:id', async (request, response) => {
  const { id } = request.params;
  const { first_name, last_name, phone, email, address } = request.body;

  const updateUserQuery = `
    UPDATE customers
    SET first_name = ?, last_name = ?, phone = ?, email = ?, address = ?
    WHERE id = ?
  `;
  await db.run(updateUserQuery, [first_name, last_name, phone, email, address, id]);
  response.send("Customer updated successfully");
});

app.delete('/customers/:id', async (request, response) => {
  const { id } = request.params;

  const query = `DELETE FROM customers WHERE id = ?`;
  await db.run(query, [id]);
  response.send("Customer deleted successfully");
});

// Address routes
app.post('/customers/:id/addresses', async (req, res) => {
  const { id } = req.params;
  const { address } = req.body;

  const insertAddressQuery = `
    INSERT INTO addresses (customer_id, address)
    VALUES (?, ?)
  `;
  const result = await db.run(insertAddressQuery, [id, address]);
  const newAddress = await db.get('SELECT * FROM addresses WHERE id = ?', [result.lastID]);
  res.send({ newAddress });
});

app.get('/customers/:id/addresses', async (req, res) => {
  const { id } = req.params;

  const query = `SELECT * FROM addresses WHERE customer_id = ?`;
  const addresses = await db.all(query, [id]);
  res.send(addresses);
});

app.delete('/customers/:id/addresses/:addressId', async (req, res) => {
  const { id, addressId } = req.params;

  const deleteAddressQuery = `
    DELETE FROM addresses
    WHERE customer_id = ? AND id = ?
  `;
  await db.run(deleteAddressQuery, [id, addressId]);
  res.send({ message: 'Address deleted successfully' });
});
