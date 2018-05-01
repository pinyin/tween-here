module.exports = {
    'roots': [
        './src',
    ],
    'transform': {
        '^.+\\.tsx?$': 'ts-jest'
    },
    'testRegex': '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
    'moduleFileExtensions': [
        'ts',
        'tsx',
        'js',
        'jsx',
        'json',
        'node'
    ],
    // 'moduleNameMapper': {
    //     '^transformation-matrix/(.*)':
    //         '<rootDir>/node_modules/transformation-matrix/build-commonjs/$1'
    // },
    'verbose': true,
    'globals': {
        'ts-jest': {
            'useBabelrc': true
        }
    }
}
