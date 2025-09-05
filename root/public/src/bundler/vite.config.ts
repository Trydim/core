import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
//import vueDevTools from 'vite-plugin-vue-devtools'

const DIST_DIR = "dist"; // Directory where the built files are output (relative to PUBLIC_DIR)

/**
 * Получить результирующую папку в зависимости от расположения папки src
 * @returns string
 */
const getOutputPath = () => {
  const outputPath = '../../' + (path.basename(path.resolve(__dirname, '../../')) !== 'public' ? 'public/' : '');
  return path.resolve(__dirname, outputPath);
}

function makeId(length: number) {
  return crypto.createHash('md5').update(Math.random().toString()).digest('hex').slice(0, length);
}

// https://vite.dev/config/
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  const isDev = mode.includes('develop'),
        prodId = makeId(6),
        outputPath = getOutputPath(),
        input = {
          application: './js/application.js',
          //login: './css/login.scss',
        };

  // Удалить старые собранные файлы
  if (!isDev) {
    let cssDir = fs.readdirSync(outputPath + '/css'),
        jsDir  = fs.readdirSync(outputPath + '/js');

    fs.writeFileSync(__dirname + '/version.txt', prodId);

    Object.keys(input).forEach((fileName: string) => {
      const fn = (file: string, dir: string) => {
        if (file.includes(fileName) && file.includes('min')) {
          fs.unlinkSync(outputPath + dir + '/' + file);
        }
      }

      cssDir.forEach((file) => fn(file, '/css'));
      jsDir.forEach((file) => fn(file, '/js'));
    });
  }

  //const env = loadEnv(mode, process.cwd(), '')

  return {
    root: path.resolve(__dirname, '../js'), // root directory for the client-side source code
    base: `/${DIST_DIR}/`,                  // in dev, Vite serves files from here - in production, the server serves production files from here

    //base: '/', // Убедитесь, что base установлен в '/', если ваши активы будут загружаться с корня

    define: {
      VITE_DEV  : command === 'serve',
      BUILD_TIME: JSON.stringify(new Date().toLocaleString().replace(', ', '-')),

      //__APP_ENV__: JSON.stringify(env.APP_ENV),

      __VUE_PROD_DEVTOOLS__: isDev,
      __VUE_OPTIONS_API__: true,
    },

    build: {
      manifest: true, // Generate `manifest.json` (required for PHP backend integration)

      outDir: '../',

      rollupOptions: {
        input, //

        output: {
          entryFileNames: isDev ? 'js/[name].js'                 // Папка для JS
                                : 'js/[name]-' + prodId + '.min.js',
          chunkFileNames: 'js/[name].js',                        // Чанки JS
          assetFileNames: (assetInfo: any) => {
            return assetInfo.name.endsWith('.css')
                   ? isDev ? 'css/[name].css'
                           : 'css/[name].min.css'     // CSS
                   : 'assets/[name].[ext]'; // Папка для других ресурсов
          }
        }
      },

      assetsInlineLimit: 10240, // 10KB для SVG

      sourcemap: isDev,
      minify: !isDev,

      watch: isDev ? {
        exclude: '*node_modules/**',
      } : undefined,

      css: {
        devSourcemap: isDev,
      },
    },

    server : {
      proxy: {
        [`^/(?!${DIST_DIR}/).*`]: {
          target: 'http://localhost:8001', // PHP backend server
          changeOrigin: true, // Required for backend server to receive the correct host header (e.g. virtual hosts)
          //rewrite: path => path.replace(/^\/+/, '/')
        }
      },
    },

    plugins: [
      vue(),
      /*vueDevTools(),*/
    ],
    resolve: {
      extensions: ['.js', '.jsx', '.json', '.vue'],
      /*alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },*/
    },
  }
})
