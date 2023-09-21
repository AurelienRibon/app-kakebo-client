import { createApp } from 'vue';
import * as PluginApp from '@capacitor/app';
import * as PluginKeyboard from '@capacitor/keyboard';
import * as PluginDevice from '@capacitor/device';
import { store } from './store/store';
import { getVRippleDirective } from './directives/v-ripple';
import { getVTapDirective } from './directives/v-tap';
import App from './components/App.vue';
import './main.scss';

let lastSyncTime = 0;

setup();
updateCSSViewportHeight();
setTimeout(updateCSSViewportHeight, 1000);

const app = createApp(App);
app.directive('ripple', getVRippleDirective());
app.directive('tap', getVTapDirective());
app.mount('#app');

// -----------------------------------------------------------------------------
// SETUP
// -----------------------------------------------------------------------------

async function setup() {
  const info = await PluginDevice.Device.getInfo();
  return info.platform === 'web' ? setupPlatformWeb() : setupPlatformMobile();
}

function setupPlatformWeb() {
  store.loadAndSync();
}

function setupPlatformMobile() {
  store.loadAndSync();
  lastSyncTime = Date.now();

  PluginKeyboard.Keyboard.setAccessoryBarVisible({ isVisible: true });

  PluginApp.App.addListener('appStateChange', (state) => {
    const time = Date.now();
    if (state.isActive && time - lastSyncTime > 60 * 1000) {
      lastSyncTime = time;
      store.sync();
    }
  });
}

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

function updateCSSViewportHeight() {
  if (visualViewport?.height) {
    document.documentElement.style.setProperty('--h', `${visualViewport.height}px`);
  }
}
