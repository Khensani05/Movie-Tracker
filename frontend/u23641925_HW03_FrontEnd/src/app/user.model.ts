//attributes to save in local storage about user
export interface User{
    user_Id: number;
    userEmail: string;
    userPassword: string;
    userConfirmPassword?: string; //? to make it optional 
}