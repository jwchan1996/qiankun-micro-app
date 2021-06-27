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
      entry: process.env.NODE_ENV === 'production' ? '//main.ppap.live:7100' : '//localhost:7100',
      container: '#subapp-viewport',
      loader,
      activeRule: '/app1',
    },
    {
      name: 'app2',
      entry: process.env.NODE_ENV === 'production' ? '//main.ppap.live:7101' : '//localhost:7101',
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
// setDefaultMountApp('/react16');

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

//导航页逻辑
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

  //监听浏览器前进回退
  window.addEventListener('popstate', () => { 
    if(location.pathname === '/'){
      document.querySelector('.mainapp-sidemenu').style.visibility = 'visible'
    }
  }, false)
}

initPortal()