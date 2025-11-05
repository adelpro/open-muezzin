module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'react', 'simple-import-sort', 'tailwindcss'],
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:tailwindcss/recommended',
        'prettier'
    ],
    rules: {
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error'
    }
}
