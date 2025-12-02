//src/v2/security/login/generatePassword/generatePassword.ts
/**
 * @module generatePassword
 * @description This module provides a function to generate a hashed password for a user.
 */

import { scrypt, randomBytes } from "crypto";

export async function generatePassword(password: string): Promise<{hashedPassword: string, salt: string}> {
    // Validate the password input
    if (!password || password === "") {
        throw new Error("A password must be provided for generating a hashed password");
    }
    if (typeof password !== 'string') {
        throw new Error("Password must be a string");
    }
    // Fonction pour hacher un mot de passe
   
    return new Promise((resolve, reject) => {
        // Génère un "salt" aléatoire pour renforcer le hachage
        const salt = randomBytes(16).toString('hex');

        // Hache le mot de passe avec le salt
        scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        // Combine le salt et le hachage pour le stockage
        console.log('Generated salt : '+salt);
        console.log('Generated hashed password : ' + derivedKey.toString('hex'));
        resolve({hashedPassword: derivedKey.toString('hex'), salt: salt});
        });
    });
}