; control flow
["if" "else" "then" "otherwise"] @conditional
["while" "for"] @repeat
["try" "catch" "finalize" "throw" "yield"] @exception
"return" @keyword.return
"import" @include
"as" @keyword

; declarations
["let" "class" "inherits" "operator"] @keyword
"fu" @keyword.function
["glob" "export" "static" "pub" "async" "mut"] @keyword.modifier

; word operators
["and" "or" "not"] @keyword.operator

; literals
(number_expr) @number
(string_expr) @string
[(true_expr) (false_expr)] @boolean
(null_expr) @constant.builtin

; comments
[(line_comment) (multiline_comment)] @comment

; operators
[
  "+" "-" "*" "/" "%" "^" "~"
  "==" "!=" "===" "<" ">" "<=" ">="
  "&&" "||" "&" "|" "<<" ">>"
  "=" "+=" "-=" "*=" "/=" "%=" "^=" "&=" "|=" "~=" "<<=" ">>="
  "++" "--" "!" "()" "[]"
] @operator

; punctuation
["(" ")" "[" "]" "{" "}"] @punctuation.bracket
[";" "," "." ":" "?"] @punctuation.delimiter

; names
(fu_decl name: (ident) @function)
(class_fu_decl name: (ident) @function)
(class_decl name: (ident) @type)
(class_decl superclass: (ident) @type)
(class_conversion_operator type: (ident) @type)
(import_decl alias: (ident) @type)

(class_fu_decl name: (ident) @constructor
  (#any-of? @constructor "init" "deinit"))
(binding name: (ident) @variable.builtin
  (#eq? @variable.builtin "_"))

(let_decl (binding name: (ident) @constant))
(let_decl (binding "mut" name: (ident) @variable))
(let_decl "glob" (binding name: (ident) @variable.global))
(class_let_decl (binding name: (ident) @property))
(bind_list (binding name: (ident) @variable.parameter))
(catch_binding (ident) @variable.parameter)

; calls and access
(access_expr property: (ident) @property)
(call_expr function: (ident) @function.call)
(call_expr
  function: (access_expr property: (ident) @function.call))

; this
(this_expr) @variable.builtin
(super_expr) @variable.builtin
(print_stmt "print" @keyword.debug) ; nvim 0.10+

; escapes
(escape_sequence) @string.escape

; interpolation
["{{" "}}"] @string.escape
(interpolation ["{" "}"] @punctuation.special)

((ident) @variable
  (#set! "priority" 90))
