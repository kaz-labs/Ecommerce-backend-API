import Category from "../models/Category.js";

class CategoryService {
  static async createCategory({ name }) {
    const newCategory = new Category({ name });
    await newCategory.save();
    return newCategory;
  }

  static async getAllCategories({ skip = 0, limit = 10, sort = '-createdAt' }) {
    const categories = await Category.find({})
      .skip(skip)
      .limit(limit)
      .sort(sort);
    return categories;
  }

  static async getCategoryById(categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  }

  static async updateCategory(categoryId, { name }) {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error("Category not found");
    }
    category.name = name || category.name;
    await category.save();
    return category;
  }

  static async deleteCategory(categoryId) {
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  }
}

export default CategoryService;
