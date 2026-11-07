# [PM-Bu4dN7] Build the C program separately from optional documentation tools.
CC = gcc
CPPFLAGS = -Isrc -DBUILD_FLAGS='"$(CFLAGS)"'
CFLAGS = -std=c99 -O2 -Wall -Wextra -Wpedantic -Wconversion -Wshadow
LDLIBS = -lm
SANITIZER_LEAKS ?= 0
SOURCES = $(wildcard src/*.c src/algorithms/*.c tests/*.c)
HEADERS = $(wildcard src/*.h src/algorithms/*.h)
.PHONY: all test sanitize benchmark clean datasets docs docs-offline docs-check doxygen verify banned-check feedback
all: property_match_bench
property_match_bench: $(SOURCES) $(HEADERS) Makefile
	$(CC) $(CPPFLAGS) $(CFLAGS) $(SOURCES) -o $@ $(LDLIBS)
property_match_tests: $(SOURCES) $(HEADERS) Makefile
	$(CC) -Isrc -DPM_SANITIZED -DPM_SANITIZER_LEAKS=$(SANITIZER_LEAKS) -DBUILD_FLAGS='"-O1 address,undefined"' -std=c99 -Wall -Wextra -Wpedantic -Wconversion -Wshadow -g -O1 -fsanitize=address,undefined -fno-omit-frame-pointer $(SOURCES) -o $@ $(LDLIBS)
test: property_match_bench
	./property_match_bench --self-test
	$(MAKE) banned-check
banned-check:
	CC="$(CC)" sh tests/test_banned.sh
sanitize: property_match_tests
	./property_match_tests --self-test
benchmark: property_match_bench
	./property_match_bench --benchmark
# The last completed standard run supplies observations, not hand-entered numbers.
feedback:
	python3 scripts/annotate_results.py

# Explicit regeneration only: ordinary builds never alter frozen manifests.
datasets: property_match_bench
	./property_match_bench --generate --seed 42
clean:
	rm -f property_match_bench property_match_tests

# Python is needed only for documentation and independent regression checks.
docs:
	npm run build
docs-offline:
	python3 scripts/build_docs.py
docs-check: docs
	python3 scripts/check_starlight.py
verify:
	python3 scripts/verify_regression.py
# Alternative conventional API/source view; requires a local Doxygen installation.
doxygen:
	doxygen Doxyfile
