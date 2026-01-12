import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { FaShoppingCart, FaCheck } from 'react-icons/fa';

export default function Checkout() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phoneNumber: '',
    shippingAddress: '',
    city: '',
    postalCode: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const getProductName = (product) => {
    switch(i18n.language) {
      case 'bg': return product.nameBg;
      case 'ar': return product.nameAr;
      default: return product.nameEn;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) newErrors.customerName = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone is required';
    if (!formData.shippingAddress.trim()) newErrors.shippingAddress = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        ...formData,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: getCartTotal()
      };

      const response = await axios.post('/api/orders', orderData);
      setOrderNumber(response.data.orderNumber);
      setOrderComplete(true);
      clearCart();
    } catch (error) {
      console.error('Order submission error:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <FaShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4 text-gray-700">
            {i18n.language === 'ar' ? 'سلة التسوق فارغة' : 
             i18n.language === 'bg' ? 'Количката е празна' : 
             'Your cart is empty'}
          </h1>
          <button
            onClick={() => navigate('/shop')}
            className="btn-primary"
          >
            {i18n.language === 'ar' ? 'الذهاب للمتجر' : 
             i18n.language === 'bg' ? 'Към магазина' : 
             'Go to Shop'}
          </button>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-3xl shadow-xl p-12">
              <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <FaCheck className="text-5xl text-green-600" />
              </div>
              <h1 className="text-4xl font-bold mb-4 gradient-text">
                {i18n.language === 'ar' ? 'تم إتمام الطلب بنجاح!' : 
                 i18n.language === 'bg' ? 'Поръчката е успешна!' : 
                 'Order Completed Successfully!'}
              </h1>
              <p className="text-xl text-gray-700 mb-6">
                {i18n.language === 'ar' ? 'رقم طلبك هو:' : 
                 i18n.language === 'bg' ? 'Вашият номер на поръчка:' : 
                 'Your order number is:'}
              </p>
              <div className="bg-islamic-lightGreen rounded-xl p-6 mb-8">
                <p className="text-3xl font-bold text-islamic-green">{orderNumber}</p>
              </div>
              <p className="text-gray-600 mb-8">
                {i18n.language === 'ar' ? 'سيتم إرسال رسالة تأكيد إلى بريدك الإلكتروني. يمكنك تتبع طلبك باستخدام رقم الطلب.' :
                 i18n.language === 'bg' ? 'Ще получите потвърждение на имейла си. Може да проследите поръчката си с номера на поръчката.' :
                 'A confirmation email has been sent. You can track your order using the order number.'}
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/track-order')}
                  className="btn-primary"
                >
                  {i18n.language === 'ar' ? 'تتبع الطلب' : 
                   i18n.language === 'bg' ? 'Проследи поръчката' : 
                   'Track Order'}
                </button>
                <button
                  onClick={() => navigate('/shop')}
                  className="btn-secondary"
                >
                  {i18n.language === 'ar' ? 'مواصلة التسوق' : 
                   i18n.language === 'bg' ? 'Продължи пазаруването' : 
                   'Continue Shopping'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 gradient-text">
          {i18n.language === 'ar' ? 'إتمام الطلب' : 
           i18n.language === 'bg' ? 'Завършване на поръчка' : 
           'Checkout'}
        </h1>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <div className="card-modern p-8">
              <h2 className="text-2xl font-bold mb-6 gradient-text">
                {i18n.language === 'ar' ? 'معلومات التسليم' : 
                 i18n.language === 'bg' ? 'Информация за доставка' : 
                 'Shipping Information'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {i18n.language === 'ar' ? 'الاسم الكامل *' : 
                     i18n.language === 'bg' ? 'Пълно име *' : 
                     'Full Name *'}
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                      errors.customerName ? 'border-red-500' : 'border-gray-300 focus:border-islamic-green'
                    }`}
                  />
                  {errors.customerName && <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {i18n.language === 'ar' ? 'البريد الإلكتروني *' : 
                       i18n.language === 'bg' ? 'Имейл *' : 
                       'Email *'}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                        errors.email ? 'border-red-500' : 'border-gray-300 focus:border-islamic-green'
                      }`}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {i18n.language === 'ar' ? 'رقم الهاتف *' : 
                       i18n.language === 'bg' ? 'Телефон *' : 
                       'Phone *'}
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                        errors.phoneNumber ? 'border-red-500' : 'border-gray-300 focus:border-islamic-green'
                      }`}
                    />
                    {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {i18n.language === 'ar' ? 'عنوان التسليم *' : 
                     i18n.language === 'bg' ? 'Адрес за доставка *' : 
                     'Shipping Address *'}
                  </label>
                  <textarea
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    rows="3"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                      errors.shippingAddress ? 'border-red-500' : 'border-gray-300 focus:border-islamic-green'
                    }`}
                  />
                  {errors.shippingAddress && <p className="text-red-500 text-sm mt-1">{errors.shippingAddress}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {i18n.language === 'ar' ? 'المدينة *' : 
                       i18n.language === 'bg' ? 'Град *' : 
                       'City *'}
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                        errors.city ? 'border-red-500' : 'border-gray-300 focus:border-islamic-green'
                      }`}
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {i18n.language === 'ar' ? 'الرمز البريدي *' : 
                       i18n.language === 'bg' ? 'Пощенски код *' : 
                       'Postal Code *'}
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                        errors.postalCode ? 'border-red-500' : 'border-gray-300 focus:border-islamic-green'
                      }`}
                    />
                    {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {i18n.language === 'ar' ? 'ملاحظات إضافية' : 
                     i18n.language === 'bg' ? 'Допълнителни бележки' : 
                     'Additional Notes'}
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-islamic-green transition-all"
                    placeholder={i18n.language === 'ar' ? 'أي تعليمات خاصة؟' : 
                                i18n.language === 'bg' ? 'Специални инструкции?' : 
                                'Any special instructions?'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 
                    (i18n.language === 'ar' ? 'جاري الإرسال...' : 
                     i18n.language === 'bg' ? 'Изпращане...' : 
                     'Submitting...') :
                    (i18n.language === 'ar' ? 'تأكيد الطلب' : 
                     i18n.language === 'bg' ? 'Потвърди поръчката' : 
                     'Confirm Order')
                  }
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card-modern p-6 sticky top-4">
              <h2 className="text-2xl font-bold mb-6 gradient-text">
                {i18n.language === 'ar' ? 'ملخص الطلب' : 
                 i18n.language === 'bg' ? 'Обобщение' : 
                 'Order Summary'}
              </h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-4 border-b">
                    <img
                      src={item.imageUrl || 'https://via.placeholder.com/60'}
                      alt={getProductName(item)}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{getProductName(item)}</p>
                      <p className="text-gray-600 text-sm">
                        {item.quantity} × {item.price.toFixed(2)} BGN
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-islamic-green">
                        {(item.quantity * item.price).toFixed(2)} BGN
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {i18n.language === 'ar' ? 'المجموع الفرعي' : 
                     i18n.language === 'bg' ? 'Междинна сума' : 
                     'Subtotal'}:
                  </span>
                  <span className="font-semibold">{getCartTotal().toFixed(2)} BGN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {i18n.language === 'ar' ? 'الشحن' : 
                     i18n.language === 'bg' ? 'Доставка' : 
                     'Shipping'}:
                  </span>
                  <span className="font-semibold text-green-600">
                    {i18n.language === 'ar' ? 'مجاني' : 
                     i18n.language === 'bg' ? 'Безплатна' : 
                     'Free'}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-xl font-bold">
                    {i18n.language === 'ar' ? 'المجموع' : 
                     i18n.language === 'bg' ? 'Общо' : 
                     'Total'}:
                  </span>
                  <span className="text-2xl font-bold text-islamic-green">
                    {getCartTotal().toFixed(2)} BGN
                  </span>
                </div>
              </div>

              <div className="bg-islamic-lightGreen rounded-xl p-4 text-sm">
                <p className="font-semibold mb-2">
                  {i18n.language === 'ar' ? '✓ شحن مجاني في جميع أنحاء بلغاريا' :
                   i18n.language === 'bg' ? '✓ Безплатна доставка в цяла България' :
                   '✓ Free shipping across Bulgaria'}
                </p>
                <p>
                  {i18n.language === 'ar' ? '✓ التسليم في 3-5 أيام عمل' :
                   i18n.language === 'bg' ? '✓ Доставка за 3-5 работни дни' :
                   '✓ Delivery in 3-5 business days'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
