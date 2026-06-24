import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from './views/DashboardView.vue';
import InternsView from './views/InternsView.vue';
import CostsView from './views/CostsView.vue';
import ReplacementView from './views/ReplacementView.vue';
import PlansView from './views/PlansView.vue';
import CompletionView from './views/CompletionView.vue';
import OrganizationView from './views/OrganizationView.vue';
import ReportsView from './views/ReportsView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: DashboardView },
    { path: '/interns', component: InternsView },
    { path: '/costs', component: CostsView },
    { path: '/replacement', component: ReplacementView },
    { path: '/plans', component: PlansView },
    { path: '/completion', component: CompletionView },
    { path: '/organization', component: OrganizationView },
    { path: '/reports', component: ReportsView },
  ],
});
