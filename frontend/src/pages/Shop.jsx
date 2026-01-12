import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { FaCheck } from 'react-icons/fa';

export default function Shop() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [addedToCart, setAddedToCart] = useState({});
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['ALL', 'BOOKS', 'PRAYER_ITEMS', 'CLOTHING', 'HOME_DECOR', 'PERSONAL_CARE'];

  const filteredProducts = selectedCategory === 'ALL' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const getProductName = (product) => {
    switch(i18n.language) {
      case 'bg': return product.nameBg;
      case 'ar': return product.nameAr;
      default: return product.nameEn;
    }
  };

  const getProductDescription = (product) => {
    switch(i18n.language) {
      case 'bg': return product.descriptionBg;
      case 'ar': return product.descriptionAr;
      default: return product.descriptionEn;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-islamic-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-4 text-islamic-darkGreen">
          {t('shop.title') || 'Islamic Products Shop'}
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {t('shop.subtitle') || 'Browse our collection of authentic Islamic products'}
        </p>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-islamic-green text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p className="text-xl">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-64 bg-gray-200 overflow-hidden">
                  <img
                    src={product.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={getProductName(product)}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2">
                    {getProductName(product)}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {getProductDescription(product)}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-islamic-green">
                      {product.price.toFixed(2)} BGN
                    </span>
                    <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  <button
                    disabled={product.stock === 0}
                    onClick={() => {
                      addToCart(product);
                      setAddedToCart({ ...addedToCart, [product.id]: true });
                      setTimeout(() => {
                        setAddedToCart({ ...addedToCart, [product.id]: false });
                      }, 2000);
                    }}
                    className={`w-full mt-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                      product.stock > 0
                        ? addedToCart[product.id] 
                          ? 'bg-green-600 text-white'
                          : 'bg-islamic-green text-white hover:bg-islamic-darkGreen'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {product.stock === 0 ? (
                      i18n.language === 'ar' ? 'نفذت الكمية' :
                      i18n.language === 'bg' ? 'Изчерпан' :
                      'Out of Stock'
                    ) : addedToCart[product.id] ? (
                      <>
                        <FaCheck />
                        {i18n.language === 'ar' ? 'تمت الإضافة' :
                         i18n.language === 'bg' ? 'Добавено' :
                         'Added'}
                      </>
                    ) : (
                      i18n.language === 'ar' ? 'أضف إلى السلة' :
                      i18n.language === 'bg' ? 'Добави в количката' :
                      'Add to Cart'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
