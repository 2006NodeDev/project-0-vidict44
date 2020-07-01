import { UserDTO } from "../dtos/user-dto";
import { User } from "../models/User";

export function UserDTOtoUserConvertor( udto:UserDTO):User{
    return {
        userId:udto.userId,
        username: udto.username,
        password: udto.password,
        firstName: udto.firstname,
        lastName: udto.lastname,
        email: udto.email,
       role: {roleId: udto.roleId, role: udto.role}
    }
}