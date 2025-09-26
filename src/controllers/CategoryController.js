import CategoryService from '../services/CategoryService.js';
import controllerWrapper from '../utils/controllerWrapper.js';

class CategoryController {
  static createCategory = controllerWrapper(async (req, res) => {
    // Assuming admin role check is done in middleware
    const category = await CategoryService.createCategory(req.body);
    res.status(201).json(category);
  });

  static getAllCategories = controllerWrapper(async (req, res) => {
    const { skip, limit, sort } = req.pagination;
    const categories = await CategoryService.getAllCategories({ skip, limit, sort });
    res.status(200).json(categories);
  });

  static getSingleCategory = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    const category = await CategoryService.getCategoryById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  });

  static updateCategory = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    const category = await CategoryService.updateCategory(id, req.body);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  });

  static deleteCategory = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    const result = await CategoryService.deleteCategory(id);
    if (!result) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(204).send();
  });
}

export default CategoryController;
