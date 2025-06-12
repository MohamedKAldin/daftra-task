import axios from 'axios';
import Product from '../models/Product.js';

const ProductService = {
  async getAllProducts(page = 1, limit = 7) {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:8000/api/products?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const productsData = response.data.data || response.data;

    return {
      items: productsData.data.map(Product.fromApi),
      total: productsData.total,
      perPage: productsData.per_page || limit,
      currentPage: productsData.current_page || page,
      lastPage: productsData.last_page || Math.ceil(productsData.total / limit),
    };
  },
};

export default ProductService;
