// /system/languages/getList/index.d.ts
/**
 * @module getLanguagesList
 * @description This module retrieves the list of languages stored in the database.
 * @returns {Promise<LanguageItem[] | ErrorObject>} Une promesse qui résout avec les résultats ou rejette avec un objet d'erreur.
 */

interface ErrorObject {
    message: string;
    code: number;
}

interface LanguageItem {
    id_language: string;
    title: string;
}

export function getResults(): Promise<LanguageItem[] | ErrorObject>;