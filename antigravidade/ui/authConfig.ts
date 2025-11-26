import { Configuration, PopupRequest } from "@azure/msal-browser";

// Configuração do MSAL
export const msalConfig: Configuration = {
    auth: {
        clientId: "6132b7d4-85eb-4015-8493-098d07e2d028", // Do .env
        authority: "https://login.microsoftonline.com/b4741a82-6b6e-43a5-ad6e-1044511aaed6", // Tenant ID do .env
        redirectUri: "http://localhost:3000",
    },
    cache: {
        cacheLocation: "sessionStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    }
};

// Scopes para login
export const loginRequest: PopupRequest = {
    scopes: ["User.Read"]
};
