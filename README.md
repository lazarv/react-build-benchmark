# Benchmarks

This is a benchmark of the generated app using different bundlers.

Next.js is benchmarked both with Webpack and Turbopack, and the `@lazarv/react-server` is benchmarked with Vite. The benchmark will be extended to use Rolldown version of Vite when it's available to use with `@lazarv/react-server`.

```
node --run benchmark
node --run benchmark:small
node --run benchmark:tiny
```

Build

```
node --run build:turbopack
node --run build:react-server
```

> Webpack build fails with out of memory error when using the normal generated app (1000 pages / 1000 components)

| Benchmark | Turbopack | React Server | Webpack |
| --------- | --------- | ------------ | ------- |
| Normal    | ~17s      | ~55s         | OOM     |
| Small     | ~5s       | ~4s          | ~7s     |
| Tiny      | ~4.5s     | ~2s          | ~5.1s   |

To compare the performance more accurately, react-server build is also using the Vercel adapter, which also traces all the necessary files for a deployment, like Next.js, using `@vercel/nft`.

Without the adapter, the build time using react-server are much less:

| Benchmark | React Server without Vercel adapter |
| --------- | ----------------------------------- |
| Normal    | ~30s                                |
| Small     | ~2.5s                               |
| Tiny      | ~1.2s                               |

More files are causing Vite to struggle on the build, while Turbopack is not affected by the number of files, but it seems that it has a minimum overhead on the build even for the tiny generated app.

There are a lot of optimization opportunities for `@lazarv/react-server` to improve the build time, like optimizing the custom Vite plugins of the framework.

For Next.js most of the time is not spent with compiling the app, but optimizing the build and preparing it for a Vercel deployment. Some opt-out configuration options might help with build times.
