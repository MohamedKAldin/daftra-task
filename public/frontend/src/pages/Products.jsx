import { useAuth } from '../contexts/AuthContext.jsx';
import { useEffect, useState } from 'react';
import ProductService from '../services/ProductService.js';

function Products() {
  const { user, loading } = useAuth();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = (page) => {
    setProductsLoading(true);
    ProductService.getAllProducts(page)
      .then(({ items, total, perPage, currentPage, lastPage }) => {
        setProducts(items);
        setCurrentPage(currentPage);
        setTotalPages(lastPage);

        const initialQuantities = {};
        items.forEach(p => initialQuantities[p.id || p._id] = 0);
        setQuantities(initialQuantities);
        setProductsError(null);
      })
      .catch(() => {
        setProductsError('Failed to load products');
      })
      .finally(() => setProductsLoading(false));
  };

  useEffect(() => {
    if (user) {
      fetchProducts(currentPage);
    }
  }, [user, currentPage]);

  const handleQuantityChange = (productId, change) => {
    setQuantities(prev => {
      const current = prev[productId] || 0;
      const updated = Math.max(0, current + change);
      const newQuantities = { ...prev, [productId]: updated };
  
      // Save to localStorage
      localStorage.setItem('cartQuantities', JSON.stringify(newQuantities));
  
      return newQuantities;
    });
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>No user data found.</div>;

  return (
    <div className="container mx-auto px-4">
      <div className="row">
        <div className="col-7">
          <div className="mt-5">
            <h4><b>Casual</b></h4>
            {productsLoading && <div>Loading products...</div>}
            {productsError && <div className="text-danger">{productsError}</div>}

            {!productsLoading && !productsError && (
              <>
                <div className="row">
                  {products.length > 0 ? (
                    products.map(product => {
                      const id = product.id || product._id;
                      const quantity = quantities[id] || 0;
                      return (
                        <div className="col-md-4 mb-4" key={id}>
                          <div className="border rounded-lg shadow-sm p-3 position-relative h-100">
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

                            <h6 className="fw-bold">{product.name}</h6>
                            <span className="badge bg-light border text-muted mb-2">{product.category || 'General'}</span>

                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="fw-bold">${product.price}</span>
                              <span className="text-muted">Stock: {product.stock}</span>
                            </div>

                            <div className="d-flex justify-content-between align-items-center border rounded px-2 py-1 w-100">
                              <button
                                className="btn btn-sm btn-light count-btn"
                                onClick={() => handleQuantityChange(id, -1)}
                              >−</button>
                              <span>{quantity}</span>
                              <button
                                className="btn btn-sm btn-light count-btn"
                                onClick={() => handleQuantityChange(id, 1)}
                              >+</button>
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
                    style={{width: '100px'}}
                  >
                    <span>
                      <i class="fa-solid fa-arrow-left"></i>
                    </span>                   
                    Previous
                  </button>
                  <span> {currentPage} </span>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    style={{width: '100px'}}
                  >
                    Next 
                    <span>
                      <i class="fa-solid fa-arrow-right"></i>
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>


        <div className="col-3">
          <div className="mt-5">
            <h4>Order summary</h4>
            <div className="card p-3 shadow-sm">
              {products.filter(p => (quantities[p.id || p._id] || 0) > 0).length === 0 ? (
                <div className="text-center py-5 text-muted">Your cart is empty</div>
              ) : (
                <>
                  {products.filter(p => (quantities[p.id || p._id] || 0) > 0).map(p => {
                    const id = p.id || p._id;
                    const quantity = quantities[id];
                    return (
                      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2" key={id}>
                        <img
                          src={p.image_url}
                          alt={p.name}
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                        <div className="flex-grow-1 mx-2">
                          <div className="fw-bold small">{p.name}</div>
                          <div className="d-flex justify-content-between align-items-center border rounded px-2 py-1 w-100">
                            <button
                              className="btn btn-sm btn-light count-btn"
                              onClick={() => handleQuantityChange(id, -1)}
                            >−</button>
                            <span>{quantity}</span>
                            <button
                              className="btn btn-sm btn-light count-btn"
                              onClick={() => handleQuantityChange(id, 1)}
                            >+</button>
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold small">${p.price}</div>
                          <button className="btn btn-sm btn-link text-danger p-0" onClick={() => handleQuantityChange(id, -quantity)}>
                            <i style={{ fontSize: '26px' }} className="fa-solid fa-square-minus"></i>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Totals */}
                  <div className="border-top pt-3">
                    {(() => {
                      const subtotal = products.reduce((acc, p) => {
                        const id = p.id || p._id;
                        return acc + (p.price * (quantities[id] || 0));
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
