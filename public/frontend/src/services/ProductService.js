import axios from 'axios';
import Product from '../models/Product.js';
import ApiEndpoints from '../ApiEndpoints.js';

const ProductService = {
  async getAllProducts(page = 1, limit = 7, filters = {}) 
  {
    const token = localStorage.getItem('token');
    const { search, minPrice, maxPrice } = filters;
    
    let url = `${ApiEndpoints.products}?page=${page}&limit=${limit}`;
    
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    
    if (minPrice !== undefined && maxPrice !== undefined) {
      url += `&min_price=${minPrice}&max_price=${maxPrice}`;
    }

    const response = await axios.get(url, {
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

  async getProductsByIds(ids) {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${ApiEndpoints.productById}`, { ids }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data.map(Product.fromApi);
  },
};

export default ProductService;
