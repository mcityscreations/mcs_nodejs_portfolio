/**
 * @class Users
 */

export class Users {
    username: string;
    email: string;
    role: string;
    isActive: string;

    constructor (
        username: string,
        email: string,
        role: string,
        isActive: string,
    ) {
        this.username = username;
        this.email = email;
        this.role = role;
        this.isActive = isActive;
    }

    

}