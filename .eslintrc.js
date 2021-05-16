module.exports = {
  'root': true,
  'parser': '@typescript-eslint/parser',
  'env': {
    'browser': true,
    'es6': true,
    'node': true
  },
  'extends': [
    'eslint:recommended',
    'eslint-config-alloy/typescript',
    'plugin:@typescript-eslint/recommended'
  ],
  'rules': {
    '@typescript-eslint/no-require-imports': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/consistent-type-definitions': 0,
    '@typescript-eslint/explicit-member-accessibility': 0,
    'indent': 0,
    'quotes': [
      2,
      'single'
    ],
    'no-unused-expressions': 0,
    'guard-for-in': 2,
    'no-var': 2,
    'semi': [
      2,
      'never'
    ],
    'accessor-pairs': 2,
    'arrow-spacing': [
      2,
      {
        'before': true,
        'after': true
      }
    ],
    'block-spacing': [
      2,
      'always'
    ],
    'brace-style': [
      2,
      '1tbs',
      {
        'allowSingleLine': true
      }
    ],
    'comma-spacing': [
      2,
      {
        'before': false,
        'after': true
      }
    ],
    'comma-style': [
      2,
      'last'
    ],
    'curly': [
      2,
      'multi-line'
    ],
    'generator-star-spacing': [
      2,
      {
        'before': true,
        'after': true
      }
    ],
    'handle-callback-err': [
      2,
      '^(err|error|e)$'
    ],
    'jsx-quotes': [
      2,
      'prefer-single'
    ],
    'key-spacing': [
      2,
      {
        'beforeColon': false,
        'afterColon': true
      }
    ],
    'keyword-spacing': [
      2,
      {
        'before': true,
        'after': true
      }
    ],
    'new-cap': [
      2,
      {
        'newIsCap': true,
        'capIsNew': false
      }
    ],
    'new-parens': 2,
    'no-array-constructor': 2,
    'no-caller': 2,
    'no-empty': 1,
    'no-eval': 2,
    'no-extend-native': 2,
    'no-extra-bind': 2,
    'no-extra-parens': [
      2,
      'functions'
    ],
    'no-fallthrough': 0,
    'no-floating-decimal': 2,
    'no-implied-eval': 2,
    'no-inner-declarations': [
      2,
      'functions'
    ],
    'no-iterator': 2,
    'no-label-var': 2,
    'no-labels': [
      2,
      {
        'allowLoop': false,
        'allowSwitch': false
      }
    ],
    'no-lone-blocks': 2,
    'no-multi-str': 2,
    'no-multiple-empty-lines': [
      2,
      {
        'max': 1
      }
    ],
    'no-negated-in-lhs': 2,
    'no-new-object': 2,
    'no-new-require': 2,
    'no-new-wrappers': 2,
    'no-path-concat': 2,
    'no-proto': 2,
    'no-return-assign': [
      2,
      'except-parens'
    ],
    'no-self-compare': 2,
    'no-sequences': 2,
    'no-spaced-func': 2,
    'no-throw-literal': 2,
    'no-trailing-spaces': 2,
    'no-undef-init': 2,
    'no-unmodified-loop-condition': 2,
    'no-unneeded-ternary': [
      2,
      {
        'defaultAssignment': false
      }
    ],
    'no-unused-vars': [
      1,
      {
        'vars': 'all',
        'args': 'all'
      }
    ],
    'no-useless-call': 2,
    'no-useless-computed-key': 2,
    'no-useless-constructor': 2,
    'no-await-in-loop': 2,
    'no-whitespace-before-property': 2,
    'one-var': [
      2,
      {
        'initialized': 'never'
      }
    ],
    'operator-linebreak': [
      2,
      'after',
      {
        'overrides': {
          '?': 'before',
          ':': 'before'
        }
      }
    ],
    'padded-blocks': [
      2,
      'never'
    ],
    'space-before-blocks': [
      2,
      'always'
    ],
    'space-before-function-paren': [
      2,
      'never'
    ],
    'space-in-parens': [
      2,
      'never'
    ],
    'space-infix-ops': 2,
    'space-unary-ops': [
      2,
      {
        'words': true,
        'nonwords': false
      }
    ],
    'spaced-comment': [
      2,
      'always',
      {
        'markers': [
          'global',
          'globals',
          'eslint',
          'eslint-disable',
          '*package',
          '!',
          ','
        ]
      }
    ],
    'template-curly-spacing': [
      2,
      'never'
    ],
    'wrap-iife': [
      2,
      'any'
    ],
    'yield-star-spacing': [
      2,
      'both'
    ],
    'yoda': [
      2,
      'never'
    ],
    'prefer-const': 2,
    'object-curly-spacing': [
      2,
      'always',
      {
        'objectsInObjects': false
      }
    ],
    'array-bracket-spacing': [
      2,
      'never'
    ],
    'no-magic-numbers': [
      1,
      {
        'ignore': [
          1,
          2
        ],
        'ignoreArrayIndexes': true
      }
    ],
    'require-await': 2
  }
}