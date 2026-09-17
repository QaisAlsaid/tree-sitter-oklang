# tree-sitter-oklang
[![CI](https://github.com/QaisAlsaid/tree-sitter-oklang/actions/workflows/ci.yml/badge.svg)](https://github.com/QaisAlsaid/tree-sitter-oklang/actions/workflows/ci.yml)

[OKLang](https://codeberg.org/qais/oklang) grammar for [tree-sitter](https://github.com/tree-sitter/tree-sitter)

## Status

**v0.1.1** supports: 
 - declarations
 - statements
 - expressions
 - classes
 - string
 - escapes
 - `f"{expr}"`  interpolation.

> [!NOTE]
> Some features here are provisional until actually implemented in OKLang.

## Dev

On NixOS enter the provided development shell
```
nix develop
tree-sitter generate && tree-sitter test
tree-sitter highlight examples/factorial.ok
```

## License

[MIT License](LICENSE)
