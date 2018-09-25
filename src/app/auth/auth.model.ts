// src/app/auth/auth.model.ts
export interface UserLoginModel {
    email: string;
    password: string;
}
export interface UserRegisterModel {
    email: string;
    password: string;
    birthDate: string;
}

export interface UserModel {
    uid: string;
    email: string;
}
