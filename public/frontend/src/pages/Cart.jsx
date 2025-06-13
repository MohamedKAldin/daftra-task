import { useEffect, useState } from 'react';
import ProductService from '../services/ProductService.js';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load quantities and fetch product data
  useEffect(() => {
    const storedQuantities = JSON.parse(localStorage.getItem('cartQuantities') || '{}');

    if (Object.keys(storedQuantities).length === 0) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    setQuantities(storedQuantities);

    // Fetch only the products that are in the cart
    const fetchCartProducts = async () => {
      try {
        // Only get IDs of products that have quantity > 0
        const productIds = Object.entries(storedQuantities)
          .filter(([_, quantity]) => quantity > 0)
          .map(([id]) => Number(id));

        if (productIds.length === 0) {
          setCartItems([]);
          setLoading(false);
          return;
        }

        const products = await ProductService.getProductsByIds(productIds);
        setCartItems(products);
        setError(null);
      } catch (err) {
        setError('Failed to load cart products.');
      } finally {
        setLoading(false);
      }
    };

    fetchCartProducts();
  }, []);

  const updateQuantity = (productId, change) => {
    setQuantities(prev => {
      const updated = Math.max(0, (prev[productId] || 0) + change);
      const newQuantities = { ...prev, [productId]: updated };

      if (updated === 0) delete newQuantities[productId];

      localStorage.setItem('cartQuantities', JSON.stringify(newQuantities));
      return newQuantities;
    });

    // Also remove from UI if quantity becomes 0
    if (quantities[productId] + change <= 0) {
      setCartItems(prev => prev.filter(p => (p.id || p._id) !== productId));
    }
  };

  const getSubtotal = () =>
    cartItems.reduce((total, p) => {
      const id = p.id || p._id;
      return total + p.price * (quantities[id] || 0);
    }, 0);

  const shipping = 15.0;
  const tax = 12.5;
  const total = getSubtotal() + shipping + tax;

  if (loading) return <div className="container mt-5">Loading cart...</div>;
  if (error) return <div className="container mt-5 text-danger">{error}</div>;

  return (
    <div className="container mt-5">
      <h2>Your Cart</h2>

      {cartItems.length === 0 ? (
        <div className="alert alert-info mt-4">Your cart is empty.</div>
      ) : (
        <div className="row">
          <div className="col-12 col-lg-8">
            {cartItems.map(product => {
              const id = product.id || product._id;
              const qty = quantities[id] || 0;

              return (
                <div key={id} className="d-flex flex-column flex-md-row align-items-center justify-content-between border-bottom py-3">
                  <div className="d-flex flex-column flex-md-row align-items-center text-center text-md-start mb-3 mb-md-0">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }}
                      className="mb-3 mb-md-0"
                    />
                    <div className="ms-md-3">
                      <h5 className="mb-1">{product.name}</h5>
                      <div className="text-muted">${product.price} × {qty}</div>
                      <div className="d-flex justify-content-center justify-content-md-start align-items-center border rounded px-2 py-1 w-100 mt-3" style={{ maxWidth: '150px' }}>
                        <button
                          className="btn btn-sm btn-light count-btn"
                          onClick={() => updateQuantity(id, -1)}
                        >−</button>
                        <input type="text" className="form-control text-center" value={qty} readOnly />
                        <button
                          className="btn btn-sm btn-light count-btn"
                          onClick={() => updateQuantity(id, 1)}
                        >+</button>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-md-end">
                    <h6 className="mb-0">${(product.price * qty).toFixed(2)}</h6>
                    <button className="btn btn-sm btn-link text-danger" onClick={() => updateQuantity(id, -qty)}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="col-12 col-lg-4 mt-4 mt-lg-0">
            <div className="card p-4 shadow-sm sticky-top" style={{ top: '20px' }}>
              <h4 className="mb-4">Summary</h4>

              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>${getSubtotal().toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <hr />
              <div className="d-flex justify-content-between mb-3 fw-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <button className="btn btn-dark w-100">Proceed to Checkout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
