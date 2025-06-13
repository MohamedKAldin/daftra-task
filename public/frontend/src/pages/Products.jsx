import { useAuth } from '../contexts/AuthContext.jsx';
import { useEffect, useState } from 'react';
import ProductService from '../services/ProductService.js';

function Products() {
  const { user, loading } = useAuth();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [cartItems, setCartItems] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const [filterPrice, setFilterPrice] = useState([0, 300]);
  const [filterName, setFilterName] = useState('');

  const fetchProducts = (page) => {
    setProductsLoading(true);
    ProductService.getAllProducts(page, 7, {
      search: filterName,
      minPrice: filterPrice[0],
      maxPrice: filterPrice[1]
    })
      .then(({ items, total, perPage, currentPage, lastPage }) => {
        setProducts(items);
        setCurrentPage(currentPage);
        setTotalPages(lastPage);

        // Merge existing quantities with new items
        setQuantities(prev => {
          const updated = { ...prev };
          items.forEach(p => {
            const id = p.id || p._id;
            if (!(id in updated)) {
              updated[id] = 0;
            }
          });
          return updated;
        });

        setProductsError(null);
      })
      .catch(() => {
        setProductsError('Failed to load products');
      })
      .finally(() => setProductsLoading(false));
  };

  useEffect(() => {
    if (user) {
      const storedQuantities = JSON.parse(localStorage.getItem('cartQuantities') || '{}');
      const storedCartItems = JSON.parse(localStorage.getItem('cartItems') || '{}');
      setQuantities(storedQuantities);
      setCartItems(storedCartItems);

      fetchProducts(currentPage);
    }
  }, [user, currentPage]);

  const handleQuantityChange = (productId, change) => {
    const product = products.find(p => (p.id || p._id) === productId);
    if (!product) return;

    setQuantities(prev => {
      const current = prev[productId] || 0;
      const updated = Math.max(0, current + change);
      const newQuantities = { ...prev, [productId]: updated };

      localStorage.setItem('cartQuantities', JSON.stringify(newQuantities));
      return newQuantities;
    });

    setCartItems(prev => {
      const newCart = { ...prev };
      if (change > 0 || (quantities[productId] || 0) + change > 0) {
        newCart[productId] = {
          id: productId,
          name: product.name,
          price: product.price,
          image_url: product.image_url
        };
      } else if ((quantities[productId] || 0) + change <= 0) {
        delete newCart[productId];
      }

      localStorage.setItem('cartItems', JSON.stringify(newCart));
      return newCart;
    });
  };

  const handleDeleteItem = (productId) => {
    setQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[productId];
      localStorage.setItem('cartQuantities', JSON.stringify(newQuantities));
      return newQuantities;
    });

    setCartItems(prev => {
      const newCart = { ...prev };
      delete newCart[productId];
      localStorage.setItem('cartItems', JSON.stringify(newCart));
      return newCart;
    });
  };

  const handleClearCart = () => {
    setQuantities({});
    setCartItems({});
    localStorage.removeItem('cartQuantities');
    localStorage.removeItem('cartItems');
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>No user data found.</div>;

  return (
    <div className="container mx-auto px-4 position-relative">
      {/* Filter Drawer */}
      <div
        className={`filter-drawer position-fixed top-0 start-0 h-100 bg-white shadow p-4${showFilter ? ' show' : ''}`}
        style={{ 
          width: '300px', 
          zIndex: 1100,
          transform: showFilter ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0">Filters</h5>
          <button className="btn btn-link text-dark" onClick={() => setShowFilter(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        {/* Price Filter */}
        <div className="mb-4">
          <label className="form-label fw-bold">Price</label>
          <input
            type="range"
            min="0"
            max="300"
            value={filterPrice[1]}
            onChange={e => setFilterPrice([0, Number(e.target.value)])}
            className="form-range"
          />
          <div className="d-flex justify-content-between">
            <span>$0</span>
            <span>${filterPrice[1]}</span>
          </div>
        </div>
        {/* Name Filter */}
        <div className="mb-4">
          <label className="form-label fw-bold">Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name"
            value={filterName}
            onChange={e => setFilterName(e.target.value)}
          />
        </div>
        <button className="btn btn-dark w-100" onClick={() => {
          setShowFilter(false);
          fetchProducts(1); // Reset to first page when applying filters
        }}>
          Apply Filter
        </button>

      </div>

      {/* Overlay when drawer is open */}
      {showFilter && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: 'rgba(0,0,0,0.2)', zIndex: 1090 }}
          onClick={() => setShowFilter(false)}
        ></div>
      )}

      {/* Products */}
      <div className="row">
        <div className="col-12 col-lg-8">
          <div className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              {/* Category Name */}
              <h4><b>Casual</b></h4>

              {/* Filter Button */}
              <button
                className="btn btn-light"
                style={{ width: 73, height: 73, fontSize: 30 }}
                onClick={() => setShowFilter(true)}
              >
                <i className="fa-solid fa-sliders"></i>
              </button>
            </div>
            
            {productsLoading && <div>Loading products...</div>}
            {productsError && <div className="text-danger">{productsError}</div>}

            {!productsLoading && !productsError && (
              <>
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
                  {products.length > 0 ? (
                    products.map(product => {
                      const id = product.id || product._id;
                      const quantity = quantities[id] || 0;
                      return (
                        <div className="col" key={id}>
                          <div className="card h-100">
                            <div className="bg-light d-flex align-items-center justify-content-center mb-3" style={{ height: '160px' }}>
                              <img
                                src={product.image_url}
                                alt={product.name}
                                style={{ maxHeight: '100%', maxWidth: '100%' }}
                              />
                              {quantity > 0 && (
                                <span className="badge rounded-circle bg-primary text-white position-absolute top-0 end-0 mt-2 me-2">
                                  {quantity}
                                </span>
                              )}
                            </div>
                            <div className="card-body">
                              <h5 className="card-title">{product.name}</h5>
                              <span className="badge bg-light border text-muted mb-2">{product.category || 'General'}</span>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="fw-bold">${product.price}</span>
                                <span className="text-muted">Stock: {product.stock}</span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center border rounded px-2 py-1 w-100">
                                <button className="btn btn-sm btn-light count-btn" onClick={() => handleQuantityChange(id, -1)}>−</button>
                                <span>{quantity}</span>
                                <button className="btn btn-sm btn-light count-btn" onClick={() => handleQuantityChange(id, 1)}>+</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-12">
                      <div className="alert alert-info">No products found.</div>
                    </div>
                  )}
                </div>

                {/* Pagination Controls */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    style={{ width: '100px' }}
                  >
                    <span><i className="fa-solid fa-arrow-left"></i></span>
                    Previous
                  </button>
                  <span> {currentPage} </span>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    style={{ width: '100px' }}
                  >
                    Next
                    <span><i className="fa-solid fa-arrow-right"></i></span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div className="col-12 col-lg-4">
          <div className="mt-5">
            <h4>Order summary</h4>
            <div className="card p-3 shadow-sm sticky-top" style={{ top: '20px' }}>
              {Object.keys(cartItems).filter(id => (quantities[id] || 0) > 0).length === 0 ? (
                <div className="text-center py-5 text-muted">Your cart is empty</div>
              ) : (
                <>
                  {Object.entries(cartItems).filter(([id]) => (quantities[id] || 0) > 0).map(([id, item]) => {
                    const quantity = quantities[id] || 0;
                    return (
                      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2" key={id}>
                        <img
                          src={item.image_url}
                          alt={item.name}
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                        <div className="flex-grow-1 mx-2">
                          <div className="fw-bold small">{item.name}</div>
                          <div className="d-flex justify-content-between align-items-center border rounded px-2 py-1 w-100">
                            <button className="btn btn-sm btn-light count-btn" onClick={() => handleQuantityChange(id, -1)}>−</button>
                            <span>{quantity}</span>
                            <button className="btn btn-sm btn-light count-btn" onClick={() => handleQuantityChange(id, 1)}>+</button>
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold small">${item.price}</div>
                          <button 
                            className="btn btn-sm btn-link text-danger p-0" 
                            onClick={() => handleDeleteItem(id)}
                          >
                            <i style={{ fontSize: '26px' }} className="fa-solid fa-square-minus"></i>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Totals */}
                  <div className="border-top pt-3">
                    {(() => {
                      const subtotal = Object.entries(cartItems).reduce((acc, [id, item]) => {
                        return acc + item.price * (quantities[id] || 0);
                      }, 0);
                      const shipping = 15;
                      const tax = 12.5;
                      const total = subtotal + shipping + tax;

                      return (
                        <>
                          <div className="d-flex justify-content-between mb-1">
                            <span>Subtotal</span>
                            <span className="fw-bold">${subtotal.toFixed(2)}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-1">
                            <span>Shipping</span>
                            <span>${shipping.toFixed(2)}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-1">
                            <span>Tax</span>
                            <span>${tax.toFixed(2)}</span>
                          </div>
                          <div className="d-flex justify-content-between border-top pt-2">
                            <strong>Total</strong>
                            <strong>${total.toFixed(2)}</strong>
                          </div>
                          <button className="btn btn-dark w-100 mt-3">Proceed to Checkout</button>
                          <button 
                            className="btn btn-outline-danger w-100 mt-2" 
                            onClick={handleClearCart}
                          >
                            Clear Cart
                          </button>
                        </>
                      );
                    })()}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Products;
