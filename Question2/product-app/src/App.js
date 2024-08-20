const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

const companies = ['AM', 'FLP', 'SNP', 'HYNT', 'AZO'];
const baseUrl = 'http://20.244.56.144/test';

const fetchProducts = async (category, minPrice, maxPrice) => {
    const requests = companies.map(company => 
        axios.get(`${baseUrl}/${company}/${category}`, {
            params: { minPrice, maxPrice }
        })
    );
    const responses = await Promise.all(requests);
    return responses.flatMap(response => response.data);
};

app.get('/categories/:category/products', async (req, res) => {
    const { category } = req.params;
    const { n = 10, page = 1, minPrice = 0, maxPrice = Infinity } = req.query;

    try {
        const products = await fetchProducts(category, minPrice, maxPrice);
        products.sort((a, b) => b.rating - a.rating); // Example sorting by rating

        const startIndex = (page - 1) * n;
        const paginatedProducts = products.slice(startIndex, startIndex + n);

        res.json({
            windowPrevState: [], // Placeholder for previous state
            windowCurrState: [], // Placeholder for current state
            numbers: paginatedProducts,
            avg: paginatedProducts.reduce((acc, product) => acc + product.price, 0) / paginatedProducts.length
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/categories/:category/products/:productid', async (req, res) => {
    const { category, productid } = req.params;

    try {
        const products = await fetchProducts(category, 0, Infinity);
        const product = products.find(p => p.id === productid);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
