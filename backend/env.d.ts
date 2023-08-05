declare global {
    namespace NodeJS {
        interface ProcessEnv {
            clientId: string;
            clientSecret: string;
        }
    }
}

export {}