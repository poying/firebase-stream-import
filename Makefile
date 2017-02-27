SRC = $(wildcard src/*.js)
LIB = $(SRC:src/%.js=lib/%.js)
BABEL = node_modules/.bin/babel


build: lib


watch:
	@watch -i 300ms make -s build


clean:
	@rm -rf lib


lib: $(LIB)
lib/%.js: src/%.js .babelrc
	@mkdir -p $(@D)
	@$(BABEL) $< -o $@
