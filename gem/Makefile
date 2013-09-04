SOURCE = ../build/slideshow
all: build
	
build: 
	@echo "Building gem"
	@mkdir -p vendor/assets/javascripts
	@mkdir -p vendor/assets/stylesheets
	@cp $(SOURCE).js vendor/assets/javascripts
	@cp $(SOURCE).css vendor/assets/stylesheets
	@gem build kaerus-component-slideshow.gemspec

distclean:
	@rm -rf vendor
	@rm *.gem

.PHONY: all