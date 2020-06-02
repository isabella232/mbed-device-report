import del from 'rollup-plugin-delete';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import sourceMaps from 'rollup-plugin-sourcemaps';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const pkg = require('./package.json')
const watch = process.env.ROLLUP_WATCH;

export default {
    input: 'src/index.ts',
    output: [
        {
            file: pkg.main,
            name: pkg.name,
            format: 'es',
            sourcemap: true
        }
    ],
    plugins: [
        !watch && del({
            targets: ['dist/*']
        }),
        typescript({
            useTsconfigDeclarationDir: true
        }),
        terser(),
        sourceMaps(),
        watch && serve({
            contentBase: '.',
            open: true,
            openPage: '/index.html',
        }),
        watch && livereload()
    ]
};
