import ProductService from '../services/ProductService.js';
import controllerWrapper from '../utils/controllerWrapper.js';

class ProductController {
  static createProduct = controllerWrapper(async (req, res) => {
    // Assuming vendor role check is done in middleware
    const product = await ProductService.createProduct(req.body);
    res.status(201).json(product);
  });

  static getAllProducts = controllerWrapper(async (req, res) => {
    const { skip, limit, sort } = req.pagination;
    const products = await ProductService.getAllProducts({ skip, limit, sort });
    res.status(200).json(products);
  });

  static getSingleProduct = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    const product = await ProductService.getProductById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  });

  static updateProduct = controllerWrapper(async (req, res) => {
    // Assuming vendor role check is done in middleware
    const { id } = req.params;
    const product = await ProductService.updateProduct(id, req.body);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  });

  static deleteProduct = controllerWrapper(async (req, res) => {
    // Assuming vendor role check is done in middleware
    const { id } = req.params;
    const result = await ProductService.deleteProduct(id);
    if (!result) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(204).send();
  });
}

export default ProductController;
