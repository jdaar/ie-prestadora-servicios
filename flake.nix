{
  description = "Devshells & deployment environment";
  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  inputs.nixpkgs.inputs.nixpkgs.url = "nixpkgs";

  outputs = { nixpkgs, ... }:
	let 
		system = "x86_64-linux";
		pkgs = import nixpkgs {
			inherit system;
			config.allowUnfree = true;
		};
		packages = with pkgs; [nodejs_22];
	in 
	{
		devShells.${system}.default = pkgs.mkShell {
			inherit system;
			name = "ie-prestadora-servicios";
			nativeBuildInputs = packages;
		};
	};
}
