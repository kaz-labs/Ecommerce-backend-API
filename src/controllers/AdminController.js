import UserService from '../services/UserService.js';
import controllerWrapper from '../utils/controllerWrapper.js';

class AdminController {
  static getAllUsers = controllerWrapper(async (req, res) => {
    const { skip, limit, sort } = req.pagination;
    // Assuming role check is done in middleware
    const users = await UserService.getAllUsers({ skip, limit, sort });
    res.status(200).json(users);
  });

  static updateUserRole = controllerWrapper(async (req, res) => {
    // Assuming role check is done in middleware
    const { id } = req.params;
    const { role } = req.body;
    const user = await UserService.updateUserRole(id, role);
    res.status(200).json({ user });
  });
}

export default AdminController;
