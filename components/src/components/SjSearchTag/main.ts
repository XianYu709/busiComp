import type {App} from 'vue';
import Component from './src/index.vue';

Component.install = (app: App): void => {
    app.component(Component.name as string, Component);
};

export default Component;
