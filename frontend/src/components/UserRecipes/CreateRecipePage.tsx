import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createUserRecipe, updateUserRecipe, getUserRecipe, uploadRecipeImage, CreateUserRecipeInput, IIngredient } from '../../lib/userRecipesApi';
import { UserAvatar } from '../UserAvatar';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../Toast';
import { ConfirmModal } from '../ConfirmModal';

export function CreateRecipePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toasts, removeToast, success, error: showError } = useToast();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [formData, setFormData] = useState<CreateUserRecipeInput>({
    name: '',
    description: '',
    cuisine: '',
    dietLabels: [],
    ingredients: [{ name: '', quantity: '', unit: '' }],
    instructions: [''],
    cookingTime: undefined,
    servings: 1,
    mealType: '',
    tags: []
  });
  const [deleteIngredientModal, setDeleteIngredientModal] = useState<{ show: boolean; index: number }>({
    show: false,
    index: -1
  });
  const [deleteInstructionModal, setDeleteInstructionModal] = useState<{ show: boolean; index: number }>({
    show: false,
    index: -1
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && id) {
      fetchRecipe(id);
    }
  }, [id]);

  const fetchRecipe = async (recipeId: string) => {
    try {
      setFetchLoading(true);
      const recipe = await getUserRecipe(recipeId);
      setFormData({
        name: recipe.name,
        description: recipe.description || '',
        cuisine: recipe.cuisine || '',
        dietLabels: recipe.dietLabels || [],
        ingredients: recipe.ingredients.length > 0 ? recipe.ingredients : [{ name: '', quantity: '', unit: '' }],
        instructions: recipe.instructions.length > 0 ? recipe.instructions : [''],
        cookingTime: recipe.cookingTime,
        servings: recipe.servings,
        mealType: recipe.mealType || '',
        tags: recipe.tags || []
      });
      // Set current image if recipe has one
      setCurrentImage(recipe.image || null);
    } catch (err: any) {
      console.error('Error fetching recipe:', err);
      showError(err.message || 'Failed to load recipe');
      navigate('/my-recipes');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      showError('Recipe name is required');
      return;
    }

    const validIngredients = formData.ingredients.filter(ing => ing.name.trim());
    if (validIngredients.length === 0) {
      showError('At least one ingredient is required');
      return;
    }

    const validInstructions = formData.instructions.filter(inst => inst.trim());
    if (validInstructions.length === 0) {
      showError('At least one instruction step is required');
      return;
    }

    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        ingredients: validIngredients,
        instructions: validInstructions,
        cookingTime: formData.cookingTime || undefined
      };

      if (isEditMode && id) {
        const result = await updateUserRecipe(id, dataToSubmit);
        success(result.message);
      } else {
        const result = await createUserRecipe(dataToSubmit);
        success(result.message);
      }

      navigate('/my-recipes');
    } catch (err: any) {
      console.error('Error saving recipe:', err);
      showError(err.message || 'Failed to save recipe');
    } finally {
      setLoading(false);
    }
  };

  // Ingredient handlers
  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: '', quantity: '', unit: '' }]
    });
  };

  const openDeleteIngredientModal = (index: number) => {
    if (formData.ingredients.length === 1) {
      showError('At least one ingredient is required');
      return;
    }
    setDeleteIngredientModal({ show: true, index });
  };

  const confirmDeleteIngredient = () => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== deleteIngredientModal.index);
    setFormData({ ...formData, ingredients: newIngredients });
    setDeleteIngredientModal({ show: false, index: -1 });
  };

  const updateIngredient = (index: number, field: keyof IIngredient, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData({ ...formData, ingredients: newIngredients });
  };

  // Instruction handlers
  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [...formData.instructions, '']
    });
  };

  const openDeleteInstructionModal = (index: number) => {
    if (formData.instructions.length === 1) {
      showError('At least one instruction step is required');
      return;
    }
    setDeleteInstructionModal({ show: true, index });
  };

  const confirmDeleteInstruction = () => {
    const newInstructions = formData.instructions.filter((_, i) => i !== deleteInstructionModal.index);
    setFormData({ ...formData, instructions: newInstructions });
    setDeleteInstructionModal({ show: false, index: -1 });
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData({ ...formData, instructions: newInstructions });
  };

  // Diet label handlers
  const toggleDietLabel = (diet: string) => {
    const current = formData.dietLabels || [];
    const updated = current.includes(diet)
      ? current.filter(d => d !== diet)
      : [...current, diet];
    setFormData({ ...formData, dietLabels: updated });
  };

  // Image handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      showError('Image size must be less than 10MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('File must be an image');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!imageFile || !id) {
      if (!id) {
        showError('Please save the recipe first before uploading an image');
      }
      return;
    }

    try {
      setUploadingImage(true);
      const result = await uploadRecipeImage(id, imageFile);
      success(result.message);
      setCurrentImage(result.recipe.image || null);
      setImageFile(null);
      setImagePreview(null);
    } catch (err: any) {
      console.error('Error uploading image:', err);
      showError(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/my-recipes')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Back to my recipes"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex-1 flex flex-col items-center justify-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? '✏️ Edit Recipe' : '➕ Create New Recipe'}
              </h1>
              <p className="text-sm text-gray-600">
                {isEditMode ? 'Update your recipe details' : 'Add your personal recipe'}
              </p>
            </div>
            
            <UserAvatar size="md" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe Name *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Grandma's Chocolate Cake"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the recipe..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-2">
                    Cuisine
                  </label>
                  <input
                    id="cuisine"
                    type="text"
                    value={formData.cuisine}
                    onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                    placeholder="e.g., Italian"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="cookingTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Cooking Time (minutes)
                  </label>
                  <input
                    id="cookingTime"
                    type="number"
                    value={formData.cookingTime || ''}
                    onChange={(e) => setFormData({ ...formData, cookingTime: e.target.value ? Number(e.target.value) : undefined })}
                    min="0"
                    placeholder="30"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-2">
                    Servings *
                  </label>
                  <input
                    id="servings"
                    type="number"
                    required
                    value={formData.servings}
                    onChange={(e) => setFormData({ ...formData, servings: Number(e.target.value) })}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="mealType" className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Type
                </label>
                <select
                  id="mealType"
                  value={formData.mealType}
                  onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select meal type</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                  <option value="dessert">Dessert</option>
                </select>
              </div>

              {/* Diet Labels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diet Labels
                </label>
                <div className="flex flex-wrap gap-2">
                  {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'low-carb', 'keto', 'paleo'].map((diet) => (
                    <button
                      key={diet}
                      type="button"
                      onClick={() => toggleDietLabel(diet)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.dietLabels?.includes(diet)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {diet}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recipe Image</h2>
            
            <div className="space-y-4">
              {/* Current Image Display */}
              {(currentImage || imagePreview) && (
                <div className="relative inline-block">
                  <img
                    src={imagePreview || currentImage || ''}
                    alt="Recipe preview"
                    className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-300"
                  />
                  {imagePreview && (
                    <span className="absolute top-2 right-2 px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                      New Image Selected
                    </span>
                  )}
                </div>
              )}

              {/* File Input */}
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                  {currentImage || imagePreview ? 'Change Image' : 'Upload Image'}
                </label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-orange-50 file:text-orange-700
                    hover:file:bg-orange-100
                    cursor-pointer"
                />
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>

              {/* Upload Button (only show if there's a file to upload) */}
              {imageFile && !uploadingImage && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Upload Image Now
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Uploading State */}
              {uploadingImage && (
                <div className="flex items-center gap-2 text-orange-600">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm font-medium">Uploading image...</span>
                </div>
              )}

              {/* Info Message */}
              {!isEditMode && (
                <p className="text-sm text-gray-600 italic">
                  💡 Tip: You can upload an image after creating the recipe or upload one now after the recipe is saved.
                </p>
              )}
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ingredients *</h2>
            
            <div className="space-y-3">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ingredient name"
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Qty"
                    value={ingredient.quantity || ''}
                    onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                    className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={ingredient.unit || ''}
                    onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                    className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => openDeleteIngredientModal(index)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      aria-label="Remove ingredient"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addIngredient}
              className="mt-4 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors font-medium"
            >
              + Add Ingredient
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Instructions *</h2>
            
            <div className="space-y-4">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <textarea
                    placeholder={`Step ${index + 1}: Describe this step...`}
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    rows={2}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {formData.instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => openDeleteInstructionModal(index)}
                      className="flex-shrink-0 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      aria-label="Remove step"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addInstruction}
              className="mt-4 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors font-medium"
            >
              + Add Step
            </button>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/my-recipes')}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                isEditMode ? 'Update Recipe' : 'Create Recipe'
              )}
            </button>
          </div>
        </form>
      </main>

      {/* Delete Ingredient Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteIngredientModal.show}
        title="Remove Ingredient"
        message="Are you sure you want to remove this ingredient from the recipe"
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={confirmDeleteIngredient}
        onCancel={() => setDeleteIngredientModal({ show: false, index: -1 })}
        type="warning"
      />

      {/* Delete Instruction Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteInstructionModal.show}
        title="Remove Step"
        message="Are you sure you want to remove this instruction step from the recipe"
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={confirmDeleteInstruction}
        onCancel={() => setDeleteInstructionModal({ show: false, index: -1 })}
        type="warning"
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default CreateRecipePage;

