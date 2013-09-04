# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'kaerus/component/slideshow/version'


Gem::Specification.new do |spec|
  spec.name          = "kaerus-component-slideshow"
  spec.version       = Kaerus::Component::Slideshow::VERSION
  spec.authors       = ["Anders Elo"]
  spec.email         = ["anders@kaerus.com"]
  spec.description   = %q{slideshow component}
  spec.summary       = %q{Created as a component.js module}
  spec.homepage      = "https://github.com/kaerus-component/slideshow"
  spec.license       = "APACHE2_0"

  spec.files         = `git ls-files`.split($/)
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler", "~> 1.3"
  spec.add_development_dependency "rake"
  spec.add_dependency "jquery-rails"
end
