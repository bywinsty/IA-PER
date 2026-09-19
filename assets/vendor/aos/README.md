# AOS 2.3.4

Official npm package: https://registry.npmjs.org/aos/-/aos-2.3.4.tgz

Source tag: https://github.com/michalsnik/aos/tree/v2.3.4

License: MIT; see LICENSE. Downloaded with `npm pack aos@2.3.4 --ignore-scripts`.
The package's dist/aos.js and dist/aos.css are used locally. No CDN is needed at runtime.
The only distribution change is an appended final LF in each dist file.
The former next/beta ESM, CommonJS and source map files were removed: they are not
part of this release's dist and no HTML page imports them.

## SHA-256

| File | Official package bytes | Stored bytes (final LF) |
| --- | --- | --- |
| aos.js | a5005b2e414770fd5ccb40bc221a12771966d02b5c1f9c89da48bd8e3811d377 | eaefa826fa1032cde0bfbab0c44ff164d6889437d99202eb2d2fc58a92d99b05 |
| aos.css | 1aa8845fd06e475aefe733d4e55b36a92fcd487975049c8172341827ac9cc03e | 731681671ddee142213a3242e4a6d3444aeae1c4f7e0630847903dab12922398 |
| LICENSE | 4d1f9c2c1c7597f1d3bb3c29aaa4e832cfc264737bccac42543486f6d202ea28 | 4d1f9c2c1c7597f1d3bb3c29aaa4e832cfc264737bccac42543486f6d202ea28 |

The site's main.js owns initialization (once after slider layout) and scheduled
refreshes. Do not replace refresh with init or introduce a per-scroll refresh.
Version 2.3.4 registers its scroll listener at init, not on every refresh.
