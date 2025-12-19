// components/FeaturedProducts.js
import styles from '../styles/FeaturedSection.module.css';

const FeaturedProducts = () => {
  const categories = [
    {
      id: 1,
      name: 'Solar Panels',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 2,
      name: 'Batteries',
      image: 'https://images.unsplash.com/photo-1603712610494-93e1543c41f7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 3,
      name: 'Inverters',
      image: 'https://images.unsplash.com/photo-1613665813446-82a78b468bcd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 4,
      name: 'Accessories',
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 5,
      name: 'Computer & Tablet',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 6,
      name: 'Cellphone',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
    }
  ];

  return (
    <section className={styles.featuredSection}>
      <h2 className={styles.sectionTitle}>Featured Products</h2>
      <div className={styles.categoriesContainer}>
        {categories.map(category => (
          <div key={category.id} className={styles.categoryCard}>
            <img 
              src={category.image} 
              alt={category.name}
              className={styles.categoryImage}
            />
            <div className={styles.categoryName}>{category.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;