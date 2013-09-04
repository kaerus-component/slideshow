TARGET = ./build
NAME = slideshow

all: build

build: dependencies standalone
	@echo "Building component "
	@component build -v -o $(TARGET)

standalone: 
	@echo "Building standalone version"
	@component build -v -o $(TARGET) -n $(NAME)

dependencies:
	@component install -v   

distclean:
	@echo "Cleaning upp files"
	@rm -rf ./node_modules
	@rm -rf ./components
	@rm -rf ./build


.PHONY: all