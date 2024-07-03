.DEFAULT_GOAL := help
SHELL := /bin/bash
UNAME_S := $(shell uname -s)
SEMVER3 := $(shell cat .version)

build:
	pnpm run build

link:
	pnpm link ./

test:
	pnpm run test:args
