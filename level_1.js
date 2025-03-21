const express = require('express');
const path = require('path');
const fs = require('fs');
const { Sequelize, DataTypes } = require('sequelize');
const methodOverride = require('method-override');

// Create express app
const app = express();
const PORT = process.env.PORT || 3000;

// Create necessary directories
const directories = [
  'public',
  'public/css',
  'public/js',
  'views',
  'views/partials',
  'views/products'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Setup middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // For handling PUT/DELETE in forms
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Create CSS file
const cssContent = `/* Custom styles for Product Management App */

body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  flex: 1;
}

.footer {
  margin-top: auto;
}

.card-img-top {
  height: 200px;
  object-fit: cover;
}

.navbar {
  margin-bottom: 1rem;
}

.jumbotron {
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 0.3rem;
}`;

fs.writeFileSync('public/css/style.css', cssContent);

// Create JS file
const jsContent = `// Client-side JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  if (typeof bootstrap !== 'undefined') {
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  // Form validation
  const forms = document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });
});`;

fs.writeFileSync('public/js/script.js', jsContent);

// Create EJS templates
const headerEjs = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= typeof title !== 'undefined' ? title : 'Product Management App' %></title>
  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Custom CSS -->
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <a class="navbar-brand" href="/">Product Management</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" href="/">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/products">Products</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/products/create">Add Product</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>`;

const footerEjs = `  <footer class="footer mt-auto py-3 bg-light">
    <div class="container">
      <span class="text-muted">Product Management App &copy; <%= new Date().getFullYear() %></span>
    </div>
  </footer>
  
  <!-- Bootstrap JS and dependencies -->
  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.min.js"></script>
  <!-- Custom JS -->
  <script src="/js/script.js"></script>
</body>
</html>`;

const indexEjs = `<%- include('partials/header') %>

<div class="container mt-4">
  <div class="jumbotron">
    <h1 class="display-4">Product Management App</h1>
    <p class="lead">A simple CRUD application using Node.js, Express, Sequelize, and EJS</p>
    <hr class="my-4">
    <p>This application allows you to manage products with full CRUD operations.</p>
    <a class="btn btn-primary btn-lg" href="/products" role="button">View All Products</a>
    <a class="btn btn-success btn-lg" href="/products/create" role="button">Create New Product</a>
  </div>
</div>

<%- include('partials/footer') %>`;

const errorEjs = `<%- include('partials/header') %>

<div class="container mt-4">
  <div class="alert alert-danger" role="alert">
    <h4 class="alert-heading"><%= error.status || 500 %> Error</h4>
    <p><%= message || 'Something went wrong!' %></p>
    <hr>
    <p class="mb-0">
      <% if (process.env.NODE_ENV === 'development' && error.stack) { %>
        <pre><%= error.stack %></pre>
      <% } %>
    </p>
  </div>
  <a href="/" class="btn btn-primary">Back to Home</a>
</div>

<%- include('partials/footer') %>`;

const productsIndexEjs = `<%- include('../partials/header') %>

<div class="container mt-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h1>Products</h1>
    <a href="/products/create" class="btn btn-success">Add New Product</a>
  </div>

  <% if (products && products.length > 0) { %>
    <div class="row">
      <% products.forEach(product => { %>
        <div class="col-md-4 mb-4">
          <div class="card">
            <% if (product.imageUrl) { %>
              <img src="<%= product.imageUrl %>" class="card-img-top" alt="<%= product.name %>" style="height: 200px; object-fit: cover;">
            <% } else { %>
              <div class="card-img-top bg-light d-flex align-items-center justify-content-center" style="height: 200px;">
                <span class="text-muted">No Image</span>
              </div>
            <% } %>
            <div class="card-body">
              <h5 class="card-title"><%= product.name %></h5>
              <p class="card-text text-truncate"><%= product.description || 'No description' %></p>
              <p class="card-text"><strong>Price:</strong> $<%= product.price.toFixed(2) %></p>
              <p class="card-text"><strong>Stock:</strong> <%= product.stock %></p>
              <div class="d-flex justify-content-between">
                <a href="/products/<%= product.id %>" class="btn btn-primary">View</a>
                <a href="/products/<%= product.id %>/edit" class="btn btn-warning">Edit</a>
                <form action="/products/<%= product.id %>?_method=DELETE" method="POST" onsubmit="return confirm('Are you sure you want to delete this product?');">
                  <button type="submit" class="btn btn-danger">Delete</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      <% }); %>
    </div>
  <% } else { %>
    <div class="alert alert-info">
      No products found. <a href="/products/create" class="alert-link">Create a new product</a>.
    </div>
  <% } %>
</div>

<%- include('../partials/footer') %>`;

const productCreateEjs = `<%- include('../partials/header') %>

<div class="container mt-4">
  <div class="card">
    <div class="card-header">
      <h1>Create New Product</h1>
    </div>
    <div class="card-body">
      <% if (typeof errors !== 'undefined' && errors.length > 0) { %>
        <div class="alert alert-danger">
          <ul class="mb-0">
            <% errors.forEach(error => { %>
              <li><%= error.message %></li>
            <% }); %>
          </ul>
        </div>
      <% } %>
      
      <form action="/products" method="POST">
        <div class="mb-3">
          <label for="name" class="form-label">Name</label>
          <input type="text" class="form-control" id="name" name="name" value="<%= typeof product !== 'undefined' ? product.name || '' : '' %>" required>
        </div>
        
        <div class="mb-3">
          <label for="description" class="form-label">Description</label>
          <textarea class="form-control" id="description" name="description" rows="3"><%= typeof product !== 'undefined' ? product.description || '' : '' %></textarea>
        </div>
        
        <div class="mb-3">
          <label for="price" class="form-label">Price</label>
          <div class="input-group">
            <span class="input-group-text">$</span>
            <input type="number" class="form-control" id="price" name="price" step="0.01" min="0" value="<%= typeof product !== 'undefined' ? product.price || '0.00' : '0.00' %>" required>
          </div>
        </div>
        
        <div class="mb-3">
          <label for="stock" class="form-label">Stock</label>
          <input type="number" class="form-control" id="stock" name="stock" min="0" value="<%= typeof product !== 'undefined' ? product.stock || '0' : '0' %>" required>
        </div>
        
        <div class="mb-3">
          <label for="imageUrl" class="form-label">Image URL</label>
          <input type="url" class="form-control" id="imageUrl" name="imageUrl" value="<%= typeof product !== 'undefined' ? product.imageUrl || '' : '' %>">
          <div class="form-text">Optional. Provide a URL to an image of the product.</div>
        </div>
        
        <div class="d-flex justify-content-between">
          <a href="/products" class="btn btn-secondary">Cancel</a>
          <button type="submit" class="btn btn-success">Create Product</button>
        </div>
      </form>
    </div>
  </div>
</div>

<%- include('../partials/footer') %>`;

const productShowEjs = `<%- include('../partials/header') %>

<div class="container mt-4">
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h1><%= product.name %></h1>
      <div>
        <a href="/products" class="btn btn-primary">Back to List</a>
        <a href="/products/<%= product.id %>/edit" class="btn btn-warning">Edit</a>
        <form action="/products/<%= product.id %>?_method=DELETE" method="POST" class="d-inline" onsubmit="return confirm('Are you sure you want to delete this product?');">
          <button type="submit" class="btn btn-danger">Delete</button>
        </form>
      </div>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-md-4">
          <% if (product.imageUrl) { %>
            <img src="<%= product.imageUrl %>" class="img-fluid rounded" alt="<%= product.name %>">
          <% } else { %>
            <div class="bg-light d-flex align-items-center justify-content-center" style="height: 300px;">
              <span class="text-muted">No Image</span>
            </div>
          <% } %>
        </div>
        <div class="col-md-8">
          <div class="mb-3">
            <h5>Description</h5>
            <p><%= product.description || 'No description provided.' %></p>
          </div>
          <div class="mb-3">
            <h5>Price</h5>
            <p>$<%= product.price.toFixed(2) %></p>
          </div>
          <div class="mb-3">
            <h5>Stock</h5>
            <p><%= product.stock %> units</p>
          </div>
          <div class="mb-3">
            <h5>Created At</h5>
            <p><%= product.createdAt.toLocaleString() %></p>
          </div>
          <div class="mb-3">
            <h5>Last Updated</h5>
            <p><%= product.updatedAt.toLocaleString() %></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<%- include('../partials/footer') %>`;

const productEditEjs = `<%- include('../partials/header') %>

<div class="container mt-4">
  <div class="card">
    <div class="card-header">
      <h1>Edit Product</h1>
    </div>
    <div class="card-body">
      <% if (typeof errors !== 'undefined' && errors.length > 0) { %>
        <div class="alert alert-danger">
          <ul class="mb-0">
            <% errors.forEach(error => { %>
              <li><%= error.message %></li>
            <% }); %>
          </ul>
        </div>
      <% } %>
      
      <form action="/products/<%= product.id %>?_method=PUT" method="POST">
        <div class="mb-3">
          <label for="name" class="form-label">Name</label>
          <input type="text" class="form-control" id="name" name="name" value="<%= product.name %>" required>
        </div>
        
        <div class="mb-3">
          <label for="description" class="form-label">Description</label>
          <textarea class="form-control" id="description" name="description" rows="3"><%= product.description || '' %></textarea>
        </div>
        
        <div class="mb-3">
          <label for="price" class="form-label">Price</label>
          <div class="input-group">
            <span class="input-group-text">$</span>
            <input type="number" class="form-control" id="price" name="price" step="0.01" min="0" value="<%= product.price %>" required>
          </div>
        </div>
        
        <div class="mb-3">
          <label for="stock" class="form-label">Stock</label>
          <input type="number" class="form-control" id="stock" name="stock" min="0" value="<%= product.stock %>" required>
        </div>
        
        <div class="mb-3">
          <label for="imageUrl" class="form-label">Image URL</label>
          <input type="url" class="form-control" id="imageUrl" name="imageUrl" value="<%= product.imageUrl || '' %>">
          <div class="form-text">Optional. Provide a URL to an image of the product.</div>
        </div>
        
        <div class="d-flex justify-content-between">
          <a href="/products/<%= product.id %>" class="btn btn-secondary">Cancel</a>
          <button type="submit" class="btn btn-primary">Update Product</button>
        </div>
      </form>
    </div>
  </div>
</div>

<%- include('../partials/footer') %>`;

// Write EJS files
fs.writeFileSync('views/partials/header.ejs', headerEjs);
fs.writeFileSync('views/partials/footer.ejs', footerEjs);
fs.writeFileSync('views/index.ejs', indexEjs);
fs.writeFileSync('views/error.ejs', errorEjs);
fs.writeFileSync('views/products/index.ejs', productsIndexEjs);
fs.writeFileSync('views/products/create.ejs', productCreateEjs);
fs.writeFileSync('views/products/show.ejs', productShowEjs);
fs.writeFileSync('views/products/edit.ejs', productEditEjs);

// Setup database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

// Define Product model
const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Product name cannot be empty'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      isFloat: {
        msg: 'Price must be a number'
      },
      min: {
        args: [0],
        msg: 'Price must be greater than or equal to 0'
      }
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isInt: {
        msg: 'Stock must be an integer'
      },
      min: {
        args: [0],
        msg: 'Stock must be greater than or equal to 0'
      }
    }
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true
});

// Routes
// Home page
app.get('/', (req, res) => {
  res.render('index', { title: 'Product Management App' });
});

// Products routes
// List all products
app.get('/products', async (req, res, next) => {
  try {
    const products = await Product.findAll();
    res.render('products/index', {
      title: 'All Products',
      products
    });
  } catch (error) {
    next(error);
  }
});

// Create product form
app.get('/products/create', (req, res) => {
  res.render('products/create', {
    title: 'Create Product',
    product: {}
  });
});

// Store new product
app.post('/products', async (req, res) => {
  try {
    await Product.create({
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock, 10),
      imageUrl: req.body.imageUrl
    });
    
    res.redirect('/products');
  } catch (error) {
    res.render('products/create', {
      title: 'Create Product',
      product: req.body,
      errors: error.errors || [{ message: 'An error occurred while creating the product' }]
    });
  }
});

// Show product details
app.get('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      const err = new Error('Product not found');
      err.status = 404;
      return next(err);
    }
    
    res.render('products/show', {
      title: product.name,
      product
    });
  } catch (error) {
    next(error);
  }
});

// Edit product form
app.get('/products/:id/edit', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      const err = new Error('Product not found');
      err.status = 404;
      return next(err);
    }
    
    res.render('products/edit', {
      title: `Edit ${product.name}`,
      product
    });
  } catch (error) {
    next(error);
  }
});

// Update product
app.put('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      const err = new Error('Product not found');
      err.status = 404;
      return next(err);
    }
    
    await product.update({
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock, 10),
      imageUrl: req.body.imageUrl
    });
    
    res.redirect(`/products/${product.id}`);
  } catch (error) {
    res.render('products/edit', {
      title: `Edit ${req.body.name}`,
      product: { ...req.body, id: req.params.id },
      errors: error.errors || [{ message: 'An error occurred while updating the product' }]
    });
  }
});

// Delete product
app.delete('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      const err = new Error('Product not found');
      err.status = 404;
      return next(err);
    }
    
    await product.destroy();
    res.redirect('/products');
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).render('error', {
    title: 'Error',
    message: 'Page not found',
    error: { status: 404 }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).render('error', {
    title: 'Error',
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Create a package.json file for dependencies
const packageJson = {
  "name": "product-management-app",
  "version": "1.0.0",
  "description": "A simple CRUD application using Node.js, Express, Sequelize, and EJS",
  "main": "level_1.js",
  "scripts": {
    "start": "node level_1.js",
    "dev": "nodemon level_1.js"
  },
  "dependencies": {
    "ejs": "^3.1.9",
    "express": "^4.18.2",
    "method-override": "^3.0.0",
    "sequelize": "^6.35.2",
    "sqlite3": "^5.1.7"
  }
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

// Create README.md
const readmeContent = `# Product Management Application

A full-stack web application for product management built with Node.js, Express.js, Sequelize (SQLite), and EJS templating engine.

## Features

- Complete CRUD operations for product management
- Responsive design with Bootstrap
- SQLite database with Sequelize ORM
- EJS templating for dynamic pages

## Quick Setup

1. Install dependencies:
\`\`\`
npm install
\`\`\`

2. Start the application:
\`\`\`
npm start
\`\`\`

3. Open your browser and navigate to: http://localhost:3000

## API Endpoints

- GET / - Home page
- GET /products - List all products
- GET /products/create - Display create product form
- POST /products - Create a new product
- GET /products/:id - View a specific product
- GET /products/:id/edit - Display edit product form
- PUT /products/:id - Update a specific product
- DELETE /products/:id - Delete a specific product

## How It Works

This application is entirely contained in a single file (\`level_1.js\`) that:

1. Sets up the Express application
2. Creates necessary directories and files
3. Defines the database model
4. Sets up all routes
5. Configures error handling
6. Starts the server

When you run the application, it automatically creates a SQLite database file in the project directory.

## How to Contribute

1. Fork this repository
2. Create a new branch for your feature
3. Add your changes
4. Submit a pull request

## Deployment

To deploy this application to production:

1. Set NODE_ENV=production
2. Consider using a process manager like PM2
3. Use a reverse proxy like Nginx or Apache
`;

fs.writeFileSync('README.md', readmeContent);

// Create sample data
const createSampleData = async () => {
  const sampleProducts = [
    {
      name: 'Laptop',
      description: 'High-performance laptop with Intel Core i7, 16GB RAM, and 512GB SSD',
      price: 1299.99,
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop'
    },
    {
      name: 'Smartphone',
      description: 'Latest model with 6.7-inch OLED display, 128GB storage, and dual camera',
      price: 899.99,
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=2127&auto=format&fit=crop'
    },
    {
      name: 'Wireless Headphones',
      description: 'Noise-canceling headphones with 30-hour battery life',
      price: 199.99,
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop'
    }
  ];

  try {
    for (const product of sampleProducts) {
      await Product.create(product);
    }
    console.log('Sample data created successfully');
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
};

// Start the application
(async () => {
  try {
    // Sync database
    await sequelize.sync({ force: true });
    console.log('Database synced successfully');
    
    // Create sample data
    await createSampleData();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`
====================================================
  Product Management App is running on port ${PORT}
====================================================
  • Local URL: http://localhost:${PORT}
  • Press Ctrl+C to stop the server
====================================================
      `);
    });
  } catch (error) {
    console.error('Unable to start application:', error);
  }
})();
