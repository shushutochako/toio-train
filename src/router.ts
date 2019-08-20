import Vue from 'vue';
import Router from 'vue-router';
import Train from './views/Train.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'train',
      component: Train,
    }
  ],
});
