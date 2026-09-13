(fu_decl) @function.outer
(fu_decl body: (_) @function.inner)
(lambda_expr) @function.outer
(lambda_expr body: (_) @function.inner)

(class_decl) @class.outer
; class bodies have no wrapper node — members are direct children of
; class_decl, so "inner" here is per-member (select cycles between them)
(class_decl (class_fu_decl) @class.inner)
(class_decl (class_let_decl) @class.inner)
(class_decl (class_operator_decl) @class.inner)

(bind_list (binding) @parameter.inner)
(call_expr arguments: (expr_list) @call.inner)
