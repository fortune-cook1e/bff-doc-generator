const astData = [
    {
        controllerName: 'userController',
        apiPrefix: '/v1/user',
        apis: [
            {
                name: 'login',
                route: '/login',
                description: '登录获取userid',
                method: 'post',
                params: [
                    { value: 'metadata', type: 'MetaData', description: 'metadata', isRequired: true },
                    { value: 'miniAppId', type: 'string', description: '小程序appid', isRequired: true }
                ]
            }
        ]
    }
];
