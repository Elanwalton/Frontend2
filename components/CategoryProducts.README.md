# CategoryProducts Component

A modern, production-ready category products page with CSS modules, built for the Sunleaf Technologies e-commerce platform.

## Features

- ✅ **API Integration**: Fully integrated with existing PHP backend APIs
- ✅ **Responsive Design**: Mobile-first approach with adaptive layouts
- ✅ **CSS Modules**: Scoped styling with no conflicts
- ✅ **Search Functionality**: Real-time product search
- ✅ **Category Filtering**: Filter products by category
- ✅ **Sorting Options**: Sort by popularity, price, rating, and date
- ✅ **View Modes**: Grid and list view options
- ✅ **Pagination**: Server-side pagination support
- ✅ **Loading States**: Smooth loading indicators
- ✅ **Empty States**: User-friendly empty state messages
- ✅ **Product Actions**: Add to cart, wishlist, and quick view
- ✅ **Dark Mode Support**: Optional dark mode styling

## Usage

### Basic Implementation

```tsx
import CategoryProducts from '@/components/CategoryProducts';

export default function CategoriesPage() {
  return <CategoryProducts />;
}
```

### Routes

The component is available at:
- `/categories` - Main category products page

### API Integration

The component integrates with the following API endpoints:

1. **Get Products**: `GET /api/getProductsClients.php`
   - Query Parameters:
     - `page`: Current page number (default: 1)
     - `limit`: Products per page (default: 12)
     - `category`: Filter by category (optional)
     - `q`: Search query (optional)

   - Response Format:
   ```json
   {
     "success": true,
     "data": [
       {
         "id": 1,
         "name": "Product Name",
         "price": 1000,
         "main_image_url": "uploads/image.jpg",
         "category": "Solar Panels",
         "rating": 4.5,
         "review_count": 10,
         "brand": "Brand Name",
         "description": "Product description",
         "quantity": 50
       }
     ],
     "currentPage": 1,
     "totalPages": 5,
     "limit": 12
   }
   ```

## Categories

The component supports the following categories:

1. **All Products** - Shows all products
2. **Solar Panels** - Solar panel products
3. **Batteries** - Battery products
4. **Inverters** - Inverter products
5. **Floodlights** - Solar outdoor lights
6. **Accessories** - Mounting accessories and other items

## Features Breakdown

### Search
- Real-time search across product names, categories, and descriptions
- Debounced API calls for performance
- Clear search indicator

### Filtering
- Category-based filtering
- Visual category indicators with icons
- Active category highlighting

### Sorting
- **Most Popular**: Sort by review count
- **Price: Low to High**: Ascending price order
- **Price: High to Low**: Descending price order
- **Highest Rated**: Sort by rating
- **Newest First**: Sort by product ID (newest)

### View Modes
- **Grid View**: Card-based layout (default)
- **List View**: Detailed list layout

### Product Cards
Each product card displays:
- Product image with fallback gradient
- Brand badge
- Product name
- Category tag
- Rating and review count
- Price
- Stock status
- Add to cart button
- Wishlist and quick view buttons (on hover)

### Responsive Breakpoints

- **Desktop** (>1200px): Multi-column grid
- **Tablet** (768px - 1200px): Adjusted grid
- **Mobile** (<768px): Single column layout
- **Small Mobile** (<480px): Optimized for small screens

## Styling

The component uses CSS Modules for scoped styling:

```tsx
import styles from '@/styles/CategoryProducts.module.css';
```

### Key Style Classes

- `.container` - Main container
- `.categoriesBar` - Sticky category navigation
- `.productsGrid` - Product grid layout
- `.productCard` - Individual product card
- `.productImageContainer` - Image container with hover effects
- `.actionButtons` - Wishlist and quick view buttons
- `.addToCartButton` - Primary CTA button

### Customization

To customize colors, update the CSS variables or modify the inline styles:

```css
/* Example: Change primary color */
.addToCartButton {
  background: #your-color;
}

/* Example: Change category colors */
.categoryButton {
  background: #your-color;
}
```

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost/sunleaf-tech
```

## Integration with Existing System

The component integrates seamlessly with:

1. **CategoryContext**: Uses the existing category context
2. **Product API**: Uses `getProductsClients.php` endpoint
3. **Image Handling**: Supports the existing image upload system
4. **Routing**: Uses Next.js router for navigation

## Performance Optimizations

- Lazy loading of images
- Debounced search queries
- Optimized re-renders with React hooks
- CSS animations with GPU acceleration
- Responsive images with fallbacks

## Accessibility

- Keyboard navigation support
- ARIA labels on interactive elements
- Focus indicators
- Screen reader friendly
- Semantic HTML structure

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

Potential improvements:

1. Advanced filters (price range, brand, rating)
2. Product comparison feature
3. Wishlist integration with backend
4. Cart integration with backend
5. Product quick view modal
6. Infinite scroll option
7. Product recommendations
8. Recently viewed products

## Troubleshooting

### Products not loading
- Check API endpoint URL in environment variables
- Verify database connection
- Check browser console for errors

### Images not displaying
- Verify image paths in database
- Check file permissions on uploads folder
- Ensure CORS headers are set correctly

### Styling issues
- Clear browser cache
- Check CSS module import paths
- Verify no conflicting global styles

## Support

For issues or questions, contact the development team or refer to the main project documentation.
