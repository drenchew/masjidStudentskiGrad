import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaTimes, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';

export default function ShoppingCart() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartCount, clearCart } = useCart();

  const getProductName = (product) => {
    switch(i18n.language) {
      case 'bg': return product.nameBg;
      case 'ar': return product.nameAr;
      default: return product.nameEn;
    }
  };

  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-white hover:text-islamic-gold transition-colors"
      >
        <FaShoppingCart className="text-2xl" />
        {getCartCount() > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {getCartCount()}
          </span>
        )}
      </button>

      {/* Cart Sidebar */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Cart Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slideInRight">
            {/* Header */}
            <div className="bg-islamic-green text-white p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FaShoppingCart />
                {i18n.language === 'ar' ? 'سلة التسوق' : 
                 i18n.language === 'bg' ? 'Количка' : 
                 'Shopping Cart'}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-islamic-gold transition-colors"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <FaShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    {i18n.language === 'ar' ? 'سلة التسوق فارغة' : 
                     i18n.language === 'bg' ? 'Количката е празна' : 
                     'Your cart is empty'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-4 flex gap-4">
                      <img
                        src={item.imageUrl || 'https://via.placeholder.com/80'}
                        alt={getProductName(item)}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-sm mb-1">{getProductName(item)}</h3>
                        <p className="text-islamic-green font-bold">{item.price.toFixed(2)} BGN</p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="bg-gray-200 hover:bg-gray-300 rounded p-1 transition-colors"
                          >
                            <FaMinus className="text-xs" />
                          </button>
                          <span className="font-bold w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="bg-gray-200 hover:bg-gray-300 rounded p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FaPlus className="text-xs" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}

                  {cartItems.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold w-full py-2"
                    >
                      {i18n.language === 'ar' ? 'إفراغ السلة' : 
                       i18n.language === 'bg' ? 'Изпразни количката' : 
                       'Clear Cart'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold">
                    {i18n.language === 'ar' ? 'المجموع' : 
                     i18n.language === 'bg' ? 'Общо' : 
                     'Total'}:
                  </span>
                  <span className="text-2xl font-bold text-islamic-green">
                    {getCartTotal().toFixed(2)} BGN
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="btn-primary w-full py-3 text-lg"
                >
                  {i18n.language === 'ar' ? 'الدفع' : 
                   i18n.language === 'bg' ? 'Поръчай' : 
                   'Checkout'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
