declare const astData: {
    controllerName: string;
    apiPrefix: string;
    apis: {
        name: string;
        route: string;
        description: string;
        method: string;
        params: {
            value: string;
            type: string;
            description: string;
            isRequired: boolean;
        }[];
    }[];
}[];
