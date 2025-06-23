// findUserById.js
import UserModel from '../models/UserModel.js';

export async function findUserById(userId) {
  return await UserModel.findById(userId);
}
