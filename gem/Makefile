SOURCE = ../build/slideshow
all: build
	
build: 
	@echo "Building gem"
	@mkdir -p lib/assets/kaerus-component/javascripts
	@mkdir -p lib/assets/kaerus-component/stylesheets
	@cp $(SOURCE).js lib/assets/kaerus-component/javascripts
	@cp $(SOURCE).css lib/assets/kaerus-component/stylesheets
	@gem build kaerus-component-slideshow.gemspec

.PHONY: all