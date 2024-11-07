# The ESM Code
the parts inside ./out/ are generated from typescript code-oss/src/*

update ./out
```shell
tsc -p .\src\tsconfig.json --outDir packages/code-oss-esm/out --declaration --target esnext
```


## TODO
Create a rollup config
Create a package.json and a dev bundle
