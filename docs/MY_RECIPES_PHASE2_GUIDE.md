# My Recipes - Phase 2 Features Implementation Guide

## Overview
This guide covers the implementation of Phase 2 features for the "My Recipes" functionality in KitchenSathi.

## Features Implemented

### 1. ✅ Recipe Rating System (1-5 Stars)
**Backend:**
- Added `rating` field to `UserRecipe` model (1-5 range)
- Created `PATCH /api/user-recipes/:id/rating` endpoint
- Validation: rating must be between 1 and 5, or null to remove

**Frontend:**
- `updateUserRecipeRating(id, rating)` API function
- Star rating component in recipe details page
- Click to rate, visual feedback

**Usage:**
```typescript
await updateUserRecipeRating(recipeId, 4); // Rate 4 stars
await updateUserRecipeRating(recipeId, null); // Remove rating
```

---

### 2. ✅ Image Upload (Cloudinary Integration)
**Backend:**
- Cloudinary service with multer for file handling
- `POST /api/user-recipes/:id/image` - Upload image
- `DELETE /api/user-recipes/:id/image` - Delete image
- Auto-optimization: 800x600 max, auto quality, WebP format
- 5MB file size limit

**Environment Variables Required:**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend:**
- `uploadRecipeImage(id, file)` API function
- File input with preview
- Drag & drop support (optional)

**Usage:**
```typescript
const file = event.target.files[0];
await uploadRecipeImage(recipeId, file);
```

---

### 3. ⏳ Recipe Sharing (To Be Implemented)
**Planned Features:**
- Share recipe via unique link
- Copy recipe to another user's collection
- Public/private recipe visibility toggle
- Social media sharing integration

**Backend Endpoints (Planned):**
```
POST   /api/user-recipes/:id/share      - Generate share link
GET    /api/shared-recipes/:shareId     - View shared recipe
POST   /api/shared-recipes/:shareId/copy - Copy to own recipes
PATCH  /api/user-recipes/:id/visibility - Toggle public/private
```

---

### 4. ⏳ Import Recipe from URL (To Be Implemented)
**Planned Features:**
- Parse recipe from popular cooking websites
- Extract: title, ingredients, instructions, image
- Support for common recipe schema formats (JSON-LD, Microdata)
- Manual editing after import

**Backend Endpoint (Planned):**
```
POST /api/user-recipes/import-url
Body: { url: string }
Response: { recipe: ParsedRecipe }
```

**Supported Sites (Planned):**
- AllRecipes
- Food Network
- BBC Good Food
- Any site with Recipe Schema markup

---

## Setup Instructions

### Backend Setup

1. **Install Dependencies:**
```bash
cd backend
npm install cloudinary multer @types/multer
```

2. **Configure Cloudinary:**
- Sign up at https://cloudinary.com
- Get your credentials from the dashboard
- Add to `.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. **Verify Configuration:**
The backend will log on startup:
```
[Cloudinary] Configured: true
```

### Frontend Setup

1. **Update Recipe Details Page:**
- Add star rating component
- Add image upload button with file input
- Display recipe image if available
- Handle loading/error states

2. **Update Create/Edit Recipe Page:**
- Add image upload section
- Show image preview
- Allow image removal

---

## API Reference

### Rating Endpoints

#### Update Recipe Rating
```http
PATCH /api/user-recipes/:id/rating
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4  // 1-5 or null
}

Response:
{
  "message": "Rating updated successfully",
  "recipe": { ... }
}
```

### Image Endpoints

#### Upload Recipe Image
```http
POST /api/user-recipes/:id/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
  image: <file>

Response:
{
  "message": "Image uploaded successfully",
  "recipe": {
    ...
    "image": "https://res.cloudinary.com/...",
    "imagePublicId": "kitchensathi/recipes/..."
  }
}
```

#### Delete Recipe Image
```http
DELETE /api/user-recipes/:id/image
Authorization: Bearer <token>

Response:
{
  "message": "Image deleted successfully",
  "recipe": { ... }
}
```

---

## Frontend Components to Add

### 1. StarRating Component
```tsx
interface StarRatingProps {
  rating?: number;
  onRate: (rating: number) => void;
  readonly?: boolean;
}
```

### 2. ImageUpload Component
```tsx
interface ImageUploadProps {
  currentImage?: string;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
  loading?: boolean;
}
```

---

## Testing Checklist

### Rating System
- [ ] Can rate recipe 1-5 stars
- [ ] Can remove rating
- [ ] Rating persists after page reload
- [ ] Rating displays correctly in recipe list
- [ ] Cannot rate with invalid values

### Image Upload
- [ ] Can upload image (JPG, PNG, WebP)
- [ ] Image is optimized and resized
- [ ] Can delete uploaded image
- [ ] Old image is deleted when uploading new one
- [ ] File size validation works (5MB limit)
- [ ] Only image files are accepted
- [ ] Image displays in recipe details
- [ ] Image displays in recipe list (thumbnail)

---

## Next Steps

1. **Implement Frontend Components:**
   - Create StarRating component
   - Create ImageUpload component
   - Integrate into RecipeDetailsPage
   - Integrate into CreateRecipePage

2. **Recipe Sharing:**
   - Design share link system
   - Implement backend endpoints
   - Create share modal UI
   - Add copy-to-clipboard functionality

3. **Import from URL:**
   - Research recipe parsing libraries
   - Implement URL parser service
   - Create import modal UI
   - Add manual editing capability

---

## Troubleshooting

### Cloudinary Upload Fails
- Check environment variables are set correctly
- Verify Cloudinary account is active
- Check file size (must be < 5MB)
- Ensure file is a valid image format

### Image Not Displaying
- Check CORS settings in Cloudinary
- Verify image URL is accessible
- Check browser console for errors

### Rating Not Saving
- Verify authentication token is valid
- Check backend logs for validation errors
- Ensure rating is between 1-5 or null

---

## Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Multer Documentation](https://github.com/expressjs/multer)
- [Recipe Schema.org](https://schema.org/Recipe)
- [Open Graph Protocol](https://ogp.me/)


