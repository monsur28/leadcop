import bcrypt from "bcryptjs";
import { AuthRepository } from "../repository";
import { RegisterInput } from "../schemas";
import { ValidationError } from "@/lib/errors";

export class AuthService {
  static async registerWithCredentials(data: RegisterInput) {
    const existingUser = await AuthRepository.findUserByEmail(data.email);
    
    if (existingUser) {
      throw new ValidationError("Email already in use");
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const newUser = await AuthRepository.createUser({
      name: data.name,
      email: data.email,
      passwordHash,
    });

    return newUser;
  }
}
