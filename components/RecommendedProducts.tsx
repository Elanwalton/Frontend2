import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  price: number;
  main_image_url: string;
}

const RecommendedProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    if (ids.length === 0) return;

    axios.post('/api/getRecommendedProducts.php', { ids })
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
    <h2
  style={{
    marginBottom: '2rem',
    fontSize: '2rem',
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    letterSpacing: '0.6px',
    fontFamily: 'Inter, sans-serif',
    position: 'relative',
    display: 'inline-block',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingBottom: '0.5rem',
    borderBottom: '4px solid #700000',
  }}
>
  Recommended for You
</h2>

      <div className="cardContainer">
        {products.map(p => (
          <div key={p.id} className="card">
            <img src={p.main_image_url} className="image" alt={p.name} />
            <div className="title">{p.name}</div>
            <div className="price">Ksh {p.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
