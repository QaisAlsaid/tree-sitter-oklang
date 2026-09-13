{
  description = "tree-sitter-oklang development shells";

  inputs = {
    nixpkgs.url = "path:/nix/store/7blcfay1hap81n2bc9j4d8b1cxrvng50-source";
  };

  outputs =
    { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };

      commonNativeBuildInputs = with pkgs; [
        pkg-config
        tree-sitter
      ];

      commonBuildInputs = with pkgs; [
      ];

      nativeShell = pkgs.mkShell {
        nativeBuildInputs = commonNativeBuildInputs ++ [
          pkgs.clang
          pkgs.nodejs
        ];
        buildInputs = commonBuildInputs;
        shellHook = ''
          exec zsh
        '';
      };
    in
    {
      devShells.${system} = {
        default = nativeShell;
      };
    };
}
