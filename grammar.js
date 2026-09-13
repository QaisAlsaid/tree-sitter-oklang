/**
 * @file OKLang grammer for tree-sitter
 * @author qais <qaisalsaid4@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC_NONE = 0;
const PREC_ASSIGNMENT = 1;
const PREC_CONDITIONAL = 2;
const PREC_OR = 3;
const PREC_AND = 4;
const PREC_BITWISE_OR = 5;
const PREC_BITWISE_XOR = 6;
const PREC_BITWISE_AND = 7;
const PREC_EQUALITY = 8;
const PREC_COMPARISON = 9;
const PREC_SHIFT = 10;
const PREC_AS = 11;
const PREC_SUM = 12;
const PREC_PRODUCT = 13;
const PREC_EXPONENT = 14;
const PREC_PREFIX = 15;
const PREC_POSTFIX = 16;
const PREC_CALL = 17;
const PREC_ACCESS = 18;
const PREC_SUBSCRIPT = 19;

export default grammar({
  name: "oklang",
  extras: $ => [
    /\s/,
    $.line_comment,
    $.multiline_comment,
  ],
  conflicts: $ => [
    [$.let_decl, $.fu_decl, $.class_decl, $.import_decl], // top level decl
    [$.let_decl, $.fu_decl, $.class_decl], // for init 
    [$.class_let_decl, $.class_fu_decl, $.class_operator_decl], // in class (decl mods)
    [$.class_fu_decl, $.class_operator_decl], // in class (declmods for functions except the ones that they share with let)
    [$.if_stmt], [$.try_stmt],
  ],

  word: $ => $.ident,

  rules: {
    // i.e. root in oklang terms
    source_file: $ => repeat(choice($._decl, $._stmt)),

    // declarations
    _decl: $ => choice(
      $.let_decl,
      $.fu_decl,
      $.class_decl,
      $.import_decl,
    ),

    // let 
    let_decl: $ => seq(
      repeat(choice(
        'glob',
        'export',
      )),
      'let',
      $.binding,
      optional(seq(
        '=',
        $._expr,
      )),
      ';',
    ),

    // fu 
    fu_decl: $ => seq(
      field('declmods', repeat(choice(
        'glob',
        'export',
        'async',
      ))),
      'fu',
      field('name', $.ident),
      '(',
      field('parameters', optional($.bind_list)),
      ')',
      field('body', $._stmt),
    ),

    binding: $ => seq(field('bindmods', optional('mut')), field('name', $.ident)),

    bind_list: $ => field('parameters', seq(
      $.binding,
      repeat(seq(',', $.binding)),
      optional(','),
    )),

    // class (tho not supported in v0.0.2 but it's ok).

    class_decl: $ => seq(
      field('declmods', repeat(choice(
        'glob',
        'export',
      ))),
      'class',
      field('name', $.ident),
      optional(seq(
        'inherits',
        field('superclass', $.ident),
      )),
      '{',
      repeat(choice(
        $.class_let_decl,
        $.class_fu_decl,
        $.class_operator_decl,
      )),
      '}',
    ),

    class_let_decl: $ => seq(
      field('declmods', repeat(choice(
        'static',
        'pub',
      ))),
      'let',
      $.binding,
      optional(seq(
        '=',
        $._expr,
      )),
      ';',
    ),

    class_fu_decl: $ => seq(
      field('declmods', repeat(choice(
        'static',
        'pub',
        'async',
      ))),
      'fu',
      field('name', $.ident),
      '(',
      optional($.bind_list),
      ')',
      $._stmt,
    ),

    class_operator_decl: $ => seq(
      field('declmods', repeat(choice(
        'pub',
        'async',
        'static',
      ))),
      'operator',
      choice(
        $.class_overridable_operator,
        $.class_conversion_operator,
      ),

      '(',
      optional($.bind_list),
      ')',
      $._stmt,
    ),

    class_conversion_operator: $ => field('type', $.ident),
    class_overridable_operator: $ => choice(
      // prefix
      '++', '--', '!', '~',
      // infix (infinix reference hehehe)
      '+', '-', '*', '/', '%', '^',
      '&', '|', '<<', '>>',
      '+=', '-=', '*=', '/=', '%=', '^=',
      '&=', '|=', '<<=', '>>=', '~=',
      '<', '>', '==', '!=', '<=', '>=', 
      // postfix
      '()', '[]',
    ),

    // import (also not supported currently).
    import_decl: $ => seq(
      field('declmods', repeat(choice(
        'export', // weird but semantically correct
        'glob',
      ))),
      'import',
      field('module', $.string_expr),
      optional(seq(
        'as',
        field('alias', $.ident),
      )),
      ';',
    ),

    // statements
    _stmt: $ => choice(
      $.compound_stmt,
      $.if_stmt,
      $.for_stmt,
      $.while_stmt,
      $.return_stmt,
      $.break_stmt,
      $.continue_stmt,
      $.try_stmt,
      $.throw_stmt,
      $.yield_stmt,
      $.print_stmt,
      $.empty_stmt,
      $.expr_stmt,
    ),

    // compound
    compound_stmt: $ => prec(1, seq(
      '{',
      repeat(choice(
        $._decl,
        $._stmt,
      )),
      '}',
    )),

    // if
    if_stmt: $ => seq(
      'if',
      field('condition', $._expr),
      '?',
      field('consequences', $._stmt),

      optional(seq(
        'else',
        optional('?'),
        field('alternative', $._stmt),
      )),
    ),

    // while 
    while_stmt: $ => seq(
      'while',
      field('condition', $._expr),
      '?',
      field('body', $._stmt),
    ),

    // for
    for_stmt: $ => seq(
      'for',
      field('initializer', choice(
        $.let_decl,
        seq(choice($.fu_decl, $.class_decl), ';'),
        ';',
      )),
      field('condition', optional($._expr)), ';', field('increment', optional($._expr)), '?', $._stmt,
    ),
    // return 
    return_stmt: $ => seq(
      'return',
      optional($._expr),
      ';',
    ),

    // break/continue
    break_stmt: $ => seq(
      'break',
      ';',
    ),

    continue_stmt: $ => seq(
      'continue',
      ';',
    ),

    // try
    catch_binding: $ => prec(1, $.ident),

    try_stmt: $ => seq(
      'try',
      field('body', $._stmt),
      'catch',
      optional(field('exception', $.catch_binding)),
      $._stmt,
      optional(seq(
        'finalize',
        $._stmt,
      )),
    ),
    // throw
    throw_stmt: $ => seq(
      'throw',
      optional($._expr),
      ';',
    ),

    // yield (ts so far fetched lol).
    yield_stmt: $ => seq(
      'yield',
      $._expr,
      ';',
    ),

    // print 
    print_stmt: $ => seq(
      'print',
      $._expr,
      ';',
    ),

    // empty
    empty_stmt: $ => ';',

    // expressions statement
    expr_stmt: $ => seq(
      $._expr,
      ';',
    ),

    // expressions
    _expr: $ => choice (
      $.assignment_expr,
      $.compound_assignment_expr,
      $.conditional_expr,
      $.binary_expr,
      $.as_expr,
      $.unary_expr,
      $.postfix_expr,
      $.call_expr,
      $.subscript_expr,
      $.access_expr,
      $._primary_expr,
    ),

    // assignment 
    assignment_expr: $ => prec.right(
      PREC_ASSIGNMENT,
      seq(
        field('lhs', $.lvalue_expr),
        '=',
        field('rhs', $._expr),
      ),
    ),

    // compound assignment
    compound_assignment_expr: $ => prec.right(
      PREC_ASSIGNMENT,
      seq(
        field('lhs', $.lvalue_expr),
        choice(
          '+=',
          '-=',
          '*=',
          '/=',
          '%=',
          '^=',
          '&=',
          '|=',
          '~=',
          '<<=',
          '>>=',
        ),
        field('rhs', $._expr),
      ),
    ),

    // conditional
    conditional_expr: $ => prec.right(PREC_CONDITIONAL, seq(
      field('condition', $._expr),
      'then',
      field('consequences', $._expr),
      'otherwise',
      field('alternative', $._expr)
      ),
    ),

    // binary
    binary_expr: $ => choice(
      prec.left(PREC_OR, seq(
        field('lhs', $._expr),
        choice('||', 'or'),
        field('rhs', $._expr),
      )),

      prec.left(PREC_AND, seq(
        field('lhs', $._expr),
        choice('&&', 'and'),
        field('rhs', $._expr),
      )),

      prec.left(PREC_BITWISE_OR, seq(
        field('lhs', $._expr),
        '|',
        field('rhs', $._expr),
      )),

      prec.left(PREC_BITWISE_XOR, seq(
        field('lhs', $._expr),
        '^',
        field('rhs', $._expr),
      )),

      prec.left(PREC_BITWISE_AND, seq(
        field('lhs', $._expr),
        '&',
        field('rhs', $._expr),
      )),

      prec.left(PREC_EQUALITY, seq(
        field('lhs', $._expr),
        choice(
          '==',
          '!=',
          '===',
        ),
        field('rhs', $._expr),
      )),

      prec.left(PREC_COMPARISON, seq(
        field('lhs', $._expr),
        choice(
          '>',
          '<',
          '<=',
          '>=',
        ),
        field('rhs', $._expr),
      )),

      prec.left(PREC_SHIFT, seq(
        field('lhs', $._expr),
        choice(
          '<<',
          '>>'
        ),
        field('rhs', $._expr),
      )),

      prec.left(PREC_SUM, seq(
        field('lhs', $._expr),
        choice(
          '+',
          '-',
        ),
        field('rhs', $._expr),
      )),

      prec.left(PREC_PRODUCT, seq(
        field('lhs', $._expr),
        choice(
          '*',
          '/',
          '%',
        ),
        field('rhs', $._expr),
      )),
    ),

    // as
    as_expr: $ => prec.left(PREC_AS, seq(
      field('from', $._expr),
      'as',
      field('to', $._expr),
    )),

    // prefix
    unary_expr: $ => prec.right(PREC_PREFIX, seq(
      choice(
        '+',
        '-',
        '!',
        'not',
        '~',
        '++',
        '--',
      ),
      $._expr,
    )),

    // postfix
    postfix_expr: $ => prec.left(PREC_POSTFIX, seq(
      $.lvalue_expr,
      choice(
        '++',
        '--',
      ),
    )),

    // call
    call_expr: $ => prec.left(PREC_CALL, seq(
      field('function', $._expr),
      '(',
      field('arguments', optional($.expr_list)),
      ')',
    )),

    // subscript 
    subscript_expr: $ => prec.left(PREC_SUBSCRIPT, seq(
      $._expr,
      '[',
      field('at', $._expr),
      ']',
    )),

    // access 
    access_expr: $ => prec.left(PREC_ACCESS, seq(
      $._expr,
      '.',
      field('property', $.ident),
    )),

    // lvalue 
    lvalue_expr: $ => choice(
      $.ident,
      $.access_expr,
      $.subscript_expr,
    ),

    // primary
    _primary_expr: $ => choice(
      $.ident,
      $.number_expr,
      $.string_expr,
      $.lambda_expr,
      $.this_expr, 
      $.super_expr,
      $.null_expr,
      $.true_expr,
      $.false_expr,
      $.array_expr,
      $.map_expr,
      $.grouping_expr,
    ),

    grouping_expr: $ => seq(
      '(',
      $._expr,
      ')',
    ),

    this_expr: $ => 'this',
    super_expr: $ => 'super',
    null_expr: $ => 'null',
    true_expr: $ => 'true',
    false_expr: $ => 'false',

    // lambda 
    lambda_expr: $ => (seq(
      'fu',
      '(',
      optional($.bind_list),
      ')',
      field('body', $._stmt),
    )),

    // array
    array_expr: $ => seq(
      '[',
      field('elements', optional($.expr_list)),
      ']',
    ),

    expr_list: $ => seq(
      $._expr,
      repeat(seq(',', $._expr)),
      optional(','),
    ),

    // map 
    map_expr: $ => seq(
      '{',
      field('elements', optional($.kv_list)),
      '}',
    ),

    kv: $ => seq(field('key', $._expr), ':', field('value', $._expr)),
    kv_list: $ => seq(
      $.kv,
      repeat(seq(',', $.kv)),
      optional(','),
    ),

    // literals
    number_expr: $ => /(?:0|[1-9][0-9]*)(?:\.[0-9]+)?/,
   
    string_expr: $ => choice(
      $.single_quoted_string,
      $.double_quoted_string,
      $.interpolated_string,
    ),

    double_quoted_string: $ => seq('"', repeat(choice($._dq_content, $.escape_sequence)), '"'),
    single_quoted_string: $ => seq("'", repeat(choice($._sq_content, $.escape_sequence)), "'"),
    _dq_content: $ => token.immediate(/[^"\\]+/),
    _sq_content: $ => token.immediate(/[^'\\]+/),

    escape_sequence: $ => token.immediate(seq('\\', choice('n', 't', 'r', '0', '\\', '"', "'"))),

    interpolated_string: $ => choice($.f_double_quoted, $.f_single_quoted),

    f_double_quoted: $ => seq(
      'f"',
      repeat(choice($._fdq_content, $.escape_sequence, $.interpolation, $._brace_escape)),
      '"',
    ),
    f_single_quoted: $ => seq(
      "f'",
      repeat(choice($._fsq_content, $.escape_sequence, $.interpolation, $._brace_escape)),
      "'",
    ),
    _fdq_content: $ => token.immediate(/[^"\\{}]+/),
    _fsq_content: $ => token.immediate(/[^'\\{}]+/),

    _brace_escape: $ => choice(token.immediate('{{'), token.immediate('}}')),

    interpolation: $ => seq('{', field('value', $._expr), '}'),
    
    // identifiers
    ident: $ => /[^0-9()\[\]{};:,.+\-*\/!=<>'"\#@%^\&|~?` \t\n\r\\$][^()\[\]{};:,.+\-*\/!=<>'"\#@%^\&|~?` \t\n\r\\$]*/,

    // comments
    line_comment: $ => token(
      seq(
        '//',
        /[^\r\n]*/,
      ),
    ),

    multiline_comment: $ => token(
      seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/',
      ),
    ),
  }
});
