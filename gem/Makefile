SOURCE = ../build/slideshow
all: build
	
build: 
	@echo "Building gem"
	@mkdir -p vendor/assets/kaerus-component/javascripts
	@mkdir -p vendor/assets/kaerus-component/stylesheets
	@cp $(SOURCE).js vendor/assets/kaerus-component/javascripts
	@cp $(SOURCE).css vendor/assets/kaerus-component/stylesheets
	@gem build kaerus-component-slideshow.gemspec

distclean:
	@rm -rf vendor
	@rm *.gem

.PHONY: all