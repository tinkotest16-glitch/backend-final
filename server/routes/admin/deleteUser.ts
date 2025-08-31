import { Request, Response } from 'express';
import { storage } from '../../storage';

export async function deleteUser(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    
    // Check if user exists
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't allow deleting admin users
    if (user.isAdmin) {
      return res.status(403).json({ message: "Cannot delete admin users" });
    }

    // Delete user data
    await storage.deleteUser(userId);

    // Delete related data
    await storage.deleteUserTrades(userId);
    await storage.deleteUserTransactions(userId);
    
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: "Failed to delete user" });
  }
}
