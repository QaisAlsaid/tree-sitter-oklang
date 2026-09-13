(fu_decl) @function.outer
(fu_decl body: (compound_stmt) @function.inner)
(class_decl) @class.outer
(class_decl body: (compound_stmt) @class.inner
(bind_list) @parameter.inner
(call_expr arguments: (expr_list) @call.inner)
