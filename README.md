# tree-sitter-oklang
[![CI](https://github.com/<gh-user>/tree-sitter-oklang/actions/workflows/ci.yml/badge.svg)](https://github.com/<gh-user>/tree-sitter-oklang/actions/workflows/ci.yml)

[OKLang](https://codeberg.org/qais/oklang) grammar for [tree-sitter](https://github.com/tree-sitter/tree-sitter)

## Status

v0.1.0: supports declarations, statements, expressions, classes, string escapes and `f"{expr}"`  interpolation.
note: some features here are provisional until actually implemented in OKLang.

## Dev

On NixOS enter the provided dev shell
```
nix nix develop
tree-sitter generate && tree-sitter test
tree-sitter highlight examples/factorial.ok
```

