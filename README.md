# qiankun 微前端应用实践与部署

[qiankun 微前端应用实践与部署（一）](https://github.com/jwchan1996/blog/issues/21)  
[qiankun 微前端应用实践与部署（二）](https://github.com/jwchan1996/blog/issues/22)  
[qiankun 微前端应用实践与部署（三）](https://github.com/jwchan1996/blog/issues/24)  
[qiankun 微前端应用实践与部署（四）](https://github.com/jwchan1996/blog/issues/28)

微前端应用分为主应用与子应用，部署方式是分别编译好主应用与子应用，将主应用与子应用部署到 `nginx` 配置好的目录即可。

代码仓库 [https://github.com/jwchan1996/qiankun-micro-app](https://github.com/jwchan1996/qiankun-micro-app)

分别进入 `portal`、`app1`、`app2` 根目录，执行:  

> 开发模式

```bash
# portal
yarn
yarn start
```
```bash
# app1、app2
npm install
npm run dev
```

> 生产模式

```bash
# portal
yarn build
```
```bash
# app1、app2
npm run build
```

## 主应用

主应用 `js` 文件引入 `qiankun` 注册子应用，并编写导航页显示跳转逻辑。

```html
<!DOCTYPE html>
<html lang="zh">

<head>
  <meta charset="UTF-8">
  <title>QianKun Example</title>
</head>

<body>
  <div class="mainapp">
    <!-- 标题栏 -->
    <header class="mainapp-header">
      <h1>导航</h1>
    </header>
    <div class="mainapp-main">
      <!-- 侧边栏 -->
      <ul class="mainapp-sidemenu">
        <li class="app1">应用一</li>
        <li class="app2">应用二</li>
      </ul>
      <!-- 子应用  -->
      <main id="subapp-container"></main>
    </div>
  </div>

  <script src="./index.js"></script>
</body>

</html>
```

主应用 `js` 入口文件：

```javascript
import { registerMicroApps, runAfterFirstMounted, setDefaultMountApp, start, initGlobalState } from 'qiankun';
import './index.less';

/**
 * 主应用 **可以使用任意技术栈**
 * 以下分别是 React 和 Vue 的示例，可切换尝试
 */
import render from './render/ReactRender';
// import render from './render/VueRender';

/**
 * Step1 初始化应用（可选）
 */
render({ loading: true });

const loader = loading => render({ loading });

/**
 * Step2 注册子应用
 */
registerMicroApps(
  [
    {
      name: 'app1',
      entry: process.env.NODE_ENV === 'production' ? '//192.168.2.192:7100' : '//localhost:7100',
      container: '#subapp-viewport',
      loader,
      activeRule: '/app1',
    },
    {
      name: 'app2',
      entry: process.env.NODE_ENV === 'production' ? '//192.168.2.192:7101' : '//localhost:7101',
      container: '#subapp-viewport',
      loader,
      activeRule: '/app2',
    }
  ],
  {
    beforeLoad: [
      app => {
        console.log('[LifeCycle] before load %c%s', 'color: green;', app.name);
      },
    ],
    beforeMount: [
      app => {
        console.log('[LifeCycle] before mount %c%s', 'color: green;', app.name);
      },
    ],
    afterUnmount: [
      app => {
        console.log('[LifeCycle] after unmount %c%s', 'color: green;', app.name);
      },
    ],
  },
);

const { onGlobalStateChange, setGlobalState } = initGlobalState({
  user: 'qiankun',
});

onGlobalStateChange((value, prev) => console.log('[onGlobalStateChange - master]:', value, prev));

setGlobalState({
  ignore: 'master',
  user: {
    name: 'master',
  },
});

/**
 * Step3 设置默认进入的子应用
 */
// setDefaultMountApp('/app1');

/**
 * Step4 启动应用
 */
start();

runAfterFirstMounted(() => {
  console.log('----------------------------------')
  console.log(process.env.NODE_ENV)
  console.log('----------------------------------')
  console.log('[MainApp] first app mounted');
});

//浏览器地址入栈
function push(subapp) { history.pushState(null, subapp, subapp) }

//配合导航页显示逻辑
function initPortal(){
  //主应用跳转
  document.querySelector('.app1').onclick = () => {
    document.querySelector('.mainapp-sidemenu').style.visibility = 'hidden'
    push('/app1')
  }
  document.querySelector('.app2').onclick = () => {
    document.querySelector('.mainapp-sidemenu').style.visibility = 'hidden'
    push('/app2')
  }

  //回到导航页
  document.querySelector('.mainapp-header h1').onclick = () => {
    push('/')
  }

  if(location.pathname !== '/'){
    document.querySelector('.mainapp-sidemenu').style.visibility = 'hidden'
  }else{
    document.querySelector('.mainapp-sidemenu').style.visibility = 'visible'
  }
  if(location.pathname.indexOf('login') > -1){
    document.querySelector('.mainapp-header').style.display = 'block'
  }else{
    document.querySelector('.mainapp-header').style.display = 'none'
  }

  //监听浏览器前进回退
  window.addEventListener('popstate', () => { 
    if(location.pathname === '/'){
      document.querySelector('.mainapp-sidemenu').style.visibility = 'visible'
    }
    if(location.pathname.indexOf('login') > -1){
      document.querySelector('.mainapp-header').style.display = 'block'
    }else{
      document.querySelector('.mainapp-header').style.display = 'none'
    }
  }, false)
}

initPortal()
```

## docker nginx 配置

此处 `nginx` 主要作用是用于端口目录转发，并配置主应用访问子应用的跨域问题。

使用 `docker` 配置部署 `nginx`：

```yaml
# docker-compose.yml

version: '3.1'
services:
  nginx:
    restart: always
    image: nginx
    container_name: nginx
    ports: 
      - 8888:80
      - 8889:8889
      - 7100:7100
      - 7101:7101
    volumes: 
      - /app/volumes/nginx/nginx.conf:/etc/nginx/nginx.conf
      - /app/volumes/nginx/html:/usr/share/nginx/html
      - /app/micro/portal:/app/micro/portal
      - /app/micro/app1:/app/micro/app1
      - /app/micro/app2:/app/micro/app2
```

将编译后的主应用以及子应用放到对应的数据卷挂载目录即可，如主应用 `/app/micro/portal`。  
同理，也需要将配置好的 `nginx.conf` 文件放到指定的数据卷挂载目录，使用 `docker-compose up -d` 启动即可。

`nginx` 端口目录转发配置：
```bash
# nginx.conf

user  nginx;
worker_processes  1;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;


events {
    worker_connections  1024;
}


http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    #gzip  on;

    include /etc/nginx/conf.d/*.conf;

    server {
      listen	8889;
      server_name 192.168.2.192;
      
      location / {
        root /app/micro/portal;
        index index.html;
        
        try_files $uri $uri/ /index.html;
      }
    }

    server {
      listen	7100;
      server_name 192.168.2.192;
      
      # 配置跨域访问，此处是通配符，严格生产环境的话可以指定为主应用 192.168.2.192:8889
      add_header Access-Control-Allow-Origin *;
      add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
      add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
      
      location / {
        root /app/micro/app1;
        index index.html;
        
        try_files $uri $uri/ /index.html;
      }
    }

    server {
      listen	7101;
      server_name 192.168.2.192;
      
      # 配置跨域访问，此处是通配符，严格生产环境的话可以指定为主应用 192.168.2.192:8889
      add_header Access-Control-Allow-Origin *;
      add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
      add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
      
      location / {
        root /app/micro/app2;
        index index.html;
        
        try_files $uri $uri/ /index.html;
      }
    }
}

```

## 子应用适配框架

下面子应用以常规 `vue` 项目为例。

### 入口文件 main.js

在入口文件增加 `qiankun` 环境判断，判断当前是 `qiankuan` 环境的则将子应用引入到主应用框架内，然后在主框架内执行正常的 `vue` 元素挂载。

```javascript
// 在所有代码的文件之前引入判断
if (window.__POWERED_BY_QIANKUN__) {
  // eslint-disable-next-line no-undef
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}

import Vue from "vue";
import App from "./App";
import router from "./router";

let instance = null;

function render(props = {}) {
  // 此处 container 是主应用生成的用于装载子应用的 div 元素
  // 如 <div id="__qiankun_microapp_wrapper_for_app_1_1596504716562__" />
  const { container } = props;
  
  instance = new Vue({
    router,
    render: h => h(App),
  }).$mount(container ? container.querySelector('#app') : '#app');
}

if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

function storeTest(props) {
  props.onGlobalStateChange &&
    props.onGlobalStateChange(
      (value, prev) => console.log(`[onGlobalStateChange - ${props.name}]:`, value, prev),
      true,
    );
  props.setGlobalState &&
    props.setGlobalState({
      ignore: props.name,
      user: {
        name: props.name,
      },
    });
}

export async function bootstrap() {
  console.log('[vue] vue app bootstraped');
}

export async function mount(props) {
  console.log('[vue] props from main framework', props);
  storeTest(props);
  render(props);
}

export async function unmount() {
  instance.$destroy();
  instance.$el.innerHTML = '';
  instance = null;
}

```

### router 配置

路由需要根据 `qiankun` 环境配置 `base` 路径，以及设置路由的 `history` 模式。

```javascript
// router/index.js
const router = new Router({
  // 此处 /app1 是子应用在主应用注册的 activeRule
  base: window.__POWERED_BY_QIANKUN__ ? '/app1' : '/',
  mode: 'history',
  routes: [
    {
        ……
        ……
    }
  ]
})

// portal/index.js
registerMicroApps(
  [
    {
      name: 'app1',
      entry: process.env.NODE_ENV === 'production' ? '//192.168.2.192:7100' : '//localhost:7100',
      container: '#subapp-viewport',
      loader,
      activeRule: '/app1',
    }
  ]
)
```

## 子应用打包

### 打包 umd 格式

```
output: {
    library: 'portal',
    libraryTarget: 'umd'
}
```

### 字体图标与 css 背景图片路径问题

默认情况下，在 `css` 引用的资源使用 `url-loader` 加载打包出来是相对路径的，所以会出现子应用的资源拼接到主应用的 `domain` 的情况，造成加载资源失败。

因为 `element-ui` 的字体图标是在 `css` 里面引入的，还有相关背景图片的引入也是在 `css` 里，所以需要配置 `webpack` 的 `url-loader`，生产模式情况下直接指定资源前缀。

```javascript
module: {
  rules: [
    {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      loader: "url-loader",
      options: {
        limit: 10000,
        name: utils.assetsPath("img/[name].[hash:7].[ext]"),
        //这里 192.168.2.192：7100 是子应用部署地址
        publicPath: process.env.NODE_ENV === 'production' ? '//192.168.2.192:7100' : ''
      }
    },
    {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      loader: "url-loader",
      options: {
        limit: 10000,
        name: utils.assetsPath("fonts/[name].[hash:7].[ext]"),
        publicPath: process.env.NODE_ENV === 'production' ? '//192.168.2.192:7101' : ''
      }
    }
  ]
}
```
