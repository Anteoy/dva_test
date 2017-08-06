const path = require( 'path' );
const __VERSION__ = require('./package.json').version;
const pxtorem = require('postcss-pxtorem');
const svgSpriteDirs = [
  require.resolve('antd-mobile').replace(/warn\.js$/, ''), // antd-mobile 内置svg
];
let __ENV__ = 'develop';
try {
  const argv = process.argv[2] || '';
  const a = argv.split('=');
  if (a[1] === 'develop') {
    __ENV__ = 'develop';
  }
  if (a[1] === 'qa') {
    __ENV__ = 'qa';
  }
  if (a[1] === 'production') {
    __ENV__ = 'production';
  }
} catch (e) {
  console.log(e);
  __ENV__ = 'develop';
}
console.log('------------------------------------------');
console.log('------------------------------------------');
console.log('');
console.log('__ENV__: ', __ENV__, '&&', '__VERSION__: ', __VERSION__);
console.log('');
console.log('------------------------------------------');
console.log('------------------------------------------');

export default {
  "entry": "src/index.js",
  svgSpriteLoaderDirs: svgSpriteDirs,
  "define": {
    "__ENV__": __ENV__,
    "__VERSION__": __VERSION__
  },
  "env": {
    "development": {
      "extraBabelPlugins": [
        "dva-hmr",
        "transform-runtime",
        [
          "import" ,
          { libraryName : "antd-mobile" , "libraryDirectory" : "lib" , "style" : true }
        ]
      ],
      extraPostCSSPlugins: [
        pxtorem({
          rootValue: 100,
          propWhiteList: [],
        }),
      ],
    },
    "production": {
        "extraBabelPlugins": [
        "transform-runtime",
        [
          "import" ,
          { libraryName : "antd-mobile" , "libraryDirectory" : "lib" , "style" : true }
        ]
      ],
      extraPostCSSPlugins: [
        pxtorem({
          rootValue: 100,
          propWhiteList: [],
        }),
      ],
    }
  },
  "proxy": {
    "/proxy/*": {
      "target": "http://192.168.101.166:8080",
      "changeOrigin": false,
      "secure": false,
      "pathRewrite": { "^/proxy" : "" }
    }
  }
}
