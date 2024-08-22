{
  description = "Devshells & deployment environment";
  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  inputs.nixvim.url = "github:nix-community/nixvim";
  inputs.nixpkgs.inputs.nixpkgs.url = "nixpkgs";

  outputs = { nixpkgs, nixvim, ... }:
	let 
		system = "x86_64-linux";
		pkgs = import nixpkgs {
			inherit system;
			config.allowUnfree = true;
		};
		packages = with pkgs; [nodejs_22];
		nvim = nixvim.legacyPackages.${system}.makeNixvimWithModule {
			inherit pkgs;
			module = import ./nvim.nix;
		};
	in 
	{
		devShells.${system}.default = pkgs.mkShell {
			inherit system;
			name = "ie-prestadora-servicios";
			nativeBuildInputs = packages;
			buildInputs = [nvim];
		};
	};
}
