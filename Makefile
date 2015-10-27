DUO = ./node_modules/.bin/duo

all: build

build:	
	@echo "Building component"
	@$(DUO) *.{js,css} -s slideshow

gem: standalone
	@make -C ./gem all

distclean:
	@echo "Cleaning upp files"
	@rm -rf ./node_modules
	@rm -rf ./components
	@rm -rf ./build
	@make -C ./gem distclean

.PHONY: build
