all: build

build: dependencies standalone
	@echo "Building component "
	@component build -v

standalone: 
	@echo "Building standalone version"
	@component build -v -n slideshow

gem: standalone
	@make -C ./gem all

dependencies:
	@component install -v   

distclean:
	@echo "Cleaning upp files"
	@rm -rf ./node_modules
	@rm -rf ./components
	@rm -rf ./build
	@make -C ./gem distclean


.PHONY: all