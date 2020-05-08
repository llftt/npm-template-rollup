module.exports = {
    
    extends:['./eslint/base.js',],
    parserOptions: {
        "ecmaVersion": 2019,
        "sourceType": 'module',
        "allowImportExportEverywhere": true,
        "ecmaFeatures":{
            jsx:true
        },
    },
    env:{
        browser: true,
        node: true,
        es6: true
    }  
}