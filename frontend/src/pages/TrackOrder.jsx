import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from '../api/axios';
import { FaSearch, FaShippingFast, FaCheckCircle, FaBox, FaClock } from 'react-icons/fa';

export default function TrackOrder() {
  const { t, i18n } = useTranslation();
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await axios.get(`/api/orders/track`, {
        params: { orderNumber, email }
      });
      setOrder(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found. Please check your order number and email.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <FaClock className="text-yellow-500 text-4xl" />;
      case 'PROCESSING':
        return <FaBox className="text-blue-500 text-4xl" />;
      case 'SHIPPED':
        return <FaShippingFast className="text-purple-500 text-4xl" />;
      case 'DELIVERED':
        return <FaCheckCircle className="text-green-500 text-4xl" />;
      case 'CANCELLED':
        return <div className="text-red-500 text-4xl">❌</div>;
      default:
        return <FaClock className="text-gray-500 text-4xl" />;
    }
  };

  const getStatusText = (status) => {
    const texts = {
      'PENDING': {
        en: 'Order Received',
        bg: 'Поръчка получена',
        ar: 'تم استلام الطلب'
      },
      'PROCESSING': {
        en: 'Processing',
        bg: 'Обработва се',
        ar: 'قيد المعالجة'
      },
      'SHIPPED': {
        en: 'Shipped',
        bg: 'Изпратена',
        ar: 'تم الشحن'
      },
      'DELIVERED': {
        en: 'Delivered',
        bg: 'Доставена',
        ar: 'تم التسليم'
      },
      'CANCELLED': {
        en: 'Cancelled',
        bg: 'Отменена',
        ar: 'ملغى'
      }
    };
    return texts[status]?.[i18n.language] || texts[status]?.['en'] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 gradient-text">
          {i18n.language === 'ar' ? 'تتبع طلبك' : 
           i18n.language === 'bg' ? 'Проследете поръчката си' : 
           'Track Your Order'}
        </h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          {i18n.language === 'ar' ? 'أدخل رقم الطلب والبريد الإلكتروني لتتبع حالة طلبك' :
           i18n.language === 'bg' ? 'Въведете номер на поръчка и имейл за проследяване на статуса на поръчката ви' :
           'Enter your order number and email to track your order status'}
        </p>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="card-modern p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-islamic-darkGreen">
                  {i18n.language === 'ar' ? 'رقم الطلب' : 
                   i18n.language === 'bg' ? 'Номер на поръчка' : 
                   'Order Number'}
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-islamic-green focus:ring-2 focus:ring-islamic-green/20 transition-all"
                  placeholder={i18n.language === 'ar' ? 'مثال: ORD-12345' : 
                              i18n.language === 'bg' ? 'Пример: ORD-12345' : 
                              'e.g., ORD-12345'}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-islamic-darkGreen">
                  {i18n.language === 'ar' ? 'البريد الإلكتروني' : 
                   i18n.language === 'bg' ? 'Имейл' : 
                   'Email Address'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-islamic-green focus:ring-2 focus:ring-islamic-green/20 transition-all"
                  placeholder={i18n.language === 'ar' ? 'بريدك الإلكتروني' : 
                              i18n.language === 'bg' ? 'Вашият имейл' : 
                              'your@email.com'}
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FaSearch />
                {loading ? 
                  (i18n.language === 'ar' ? 'جاري البحث...' : 
                   i18n.language === 'bg' ? 'Търсене...' : 
                   'Searching...') :
                  (i18n.language === 'ar' ? 'تتبع الطلب' : 
                   i18n.language === 'bg' ? 'Проследи поръчката' : 
                   'Track Order')
                }
              </button>
            </form>
          </div>
        </div>

        {/* Order Details */}
        {order && (
          <div className="max-w-4xl mx-auto animate-fadeInUp">
            {/* Status Header */}
            <div className="card-modern p-8 mb-6 text-center">
              <div className="mb-6">
                {getStatusIcon(order.status)}
              </div>
              <h2 className="text-3xl font-bold mb-2 gradient-text">
                {getStatusText(order.status)}
              </h2>
              <p className="text-gray-600 text-lg">
                {i18n.language === 'ar' ? 'رقم الطلب: ' : 
                 i18n.language === 'bg' ? 'Номер на поръчка: ' : 
                 'Order Number: '}
                <span className="font-bold text-islamic-green">{order.orderNumber}</span>
              </p>
              {order.trackingNumber && (
                <p className="text-gray-600 mt-2">
                  {i18n.language === 'ar' ? 'رقم التتبع: ' : 
                   i18n.language === 'bg' ? 'Номер за проследяване: ' : 
                   'Tracking Number: '}
                  <span className="font-bold">{order.trackingNumber}</span>
                </p>
              )}
            </div>

            {/* Order Timeline */}
            <div className="card-modern p-8 mb-6">
              <h3 className="text-2xl font-bold mb-6 gradient-text">
                {i18n.language === 'ar' ? 'مراحل الطلب' : 
                 i18n.language === 'bg' ? 'Етапи на поръчката' : 
                 'Order Timeline'}
              </h3>
              <div className="space-y-4">
                {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((status, index) => {
                  const isCompleted = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].indexOf(order.status) >= index;
                  const isCurrent = order.status === status;
                  
                  return (
                    <div key={status} className={`flex items-center gap-4 ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCurrent ? 'bg-islamic-green text-white ring-4 ring-islamic-green/30' :
                        isCompleted ? 'bg-islamic-green text-white' :
                        'bg-gray-200 text-gray-400'
                      }`}>
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold ${isCurrent ? 'text-islamic-green' : ''}`}>
                          {getStatusText(status)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            <div className="card-modern p-8 mb-6">
              <h3 className="text-2xl font-bold mb-6 gradient-text">
                {i18n.language === 'ar' ? 'المنتجات المطلوبة' : 
                 i18n.language === 'bg' ? 'Поръчани продукти' : 
                 'Ordered Items'}
              </h3>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <img 
                      src={item.product?.imageUrl || 'https://via.placeholder.com/80'} 
                      alt={item.product?.nameEn}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">
                        {i18n.language === 'bg' ? item.product?.nameBg :
                         i18n.language === 'ar' ? item.product?.nameAr :
                         item.product?.nameEn}
                      </h4>
                      <p className="text-gray-600">
                        {i18n.language === 'ar' ? 'الكمية: ' : 
                         i18n.language === 'bg' ? 'Количество: ' : 
                         'Quantity: '}{item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-islamic-green">
                        {(item.price * item.quantity).toFixed(2)} BGN
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t-2 border-gray-200">
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span className="gradient-text">
                    {i18n.language === 'ar' ? 'المجموع الكلي' : 
                     i18n.language === 'bg' ? 'Обща сума' : 
                     'Total'}
                  </span>
                  <span className="text-islamic-green">{order.totalAmount?.toFixed(2)} BGN</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="card-modern p-8">
              <h3 className="text-2xl font-bold mb-6 gradient-text">
                {i18n.language === 'ar' ? 'عنوان التسليم' : 
                 i18n.language === 'bg' ? 'Адрес за доставка' : 
                 'Shipping Address'}
              </h3>
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-lg"><strong>{order.customerName}</strong></p>
                <p className="text-gray-700">{order.shippingAddress}</p>
                <p className="text-gray-700">{order.city}, {order.postalCode}</p>
                <p className="text-gray-700">{order.phoneNumber}</p>
                <p className="text-gray-700">{order.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
