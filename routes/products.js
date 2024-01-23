const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/product-api', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Product model
const Product = require('./Product'); 

app.use(bodyParser.json());

// 1. 상품 작성 API
app.post('/products', async (req, res) => {
  try {
    const { productName, content, authorName, password } = req.body;
    const product = new Product({
      productName,
      content,
      authorName,
      password,
      status: 'FOR_SALE',
    });

    await product.save();

    res.json({ message: '판매 상품을 등록하였습니다.', product });
  } catch (error) {
    res.status(500).json({ message: '데이터 형식이 올바르지 않습니다.', error: error.message });
  }
});

// 2. 상품 목록 조회 API
const products = [
  { name: 'Product1', author: 'Author1', status: 'Active', date: '2022-01-23' },
  { name: 'Product2', author: 'Author2', status: 'Inactive', date: '2022-01-22' },

];
app.get('/products/:productName/:authorName/:productStatus', async (req, res) => {
    const { productName, authorName, productStatus } = req.params;
    let filteredProducts = [...products];
  
    if (productName !== 'undefined') {
      filteredProducts = filteredProducts.filter(product => product.name.includes(productName));
    }
  
    if (authorName !== 'undefined') {
      filteredProducts = filteredProducts.filter(product => product.author.includes(authorName));
    }
  
    if (productStatus !== 'undefined') {
      filteredProducts = filteredProducts.filter(product => product.status === productStatus);
    }
    
    filteredProducts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
    return res.status(200).json({
      products: filteredProducts,
    });
  });


// 3. 상품 상세 조회 API
app.get('/products/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve product', error: error.message });
  }
});

// 4. 상품 정보 수정 API
app.put('/products/:productId', async (req, res) => {
  try {
    const { productName, content, status, password } = req.body;
    const product = await Product.findById(req.params.productId);

    if (product && product.password === password) {
      product.productName = productName;
      product.content = content;
      product.status = status;
      await product.save();
      res.json({ message: 'Product updated successfully', product });
    } else {
      res.status(404).json({ message: 'Product not found or incorrect password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
});

// 5. 상품 삭제 API
app.delete('/products/:productId', async (req, res) => {
  try {
    const { password } = req.body;
    const product = await Product.findById(req.params.productId);

    if (product && product.password === password) {
      await product.remove();
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ message: 'Product not found or incorrect password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
