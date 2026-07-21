import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from './views/DashboardView.vue';
import InternsView from './views/InternsView.vue';
import CostsView from './views/CostsView.vue';
import ReplacementView from './views/ReplacementView.vue';
import PlansView from './views/PlansView.vue';
import CompletionView from './views/CompletionView.vue';
import OrganizationView from './views/OrganizationView.vue';
import ReportsView from './views/ReportsView.vue';
import ProfilingQAView from './views/ProfilingQAView.vue';
import IssuesView from './views/IssuesView.vue';
import SignInView from './views/auth/SignInView.vue';
import SignUpView from './views/auth/SignUpView.vue';
import ForgotPasswordView from './views/auth/ForgotPasswordView.vue';
import ResetPasswordView from './views/auth/ResetPasswordView.vue';
import { useAuthStore } from './stores/auth';

const publicOnly = { public: true, authOnly: true };
const publicRoute = { public: true };

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/sign-in', component: SignInView, meta: publicOnly },
    { path: '/sign-up', component: SignUpView, meta: publicOnly },
    { path: '/forgot-password', component: ForgotPasswordView, meta: publicRoute },
    { path: '/reset-password', component: ResetPasswordView, meta: publicRoute },
    { path: '/', component: DashboardView },
    { path: '/interns', component: InternsView },
    { path: '/costs', component: CostsView },
    { path: '/replacement', component: ReplacementView },
    { path: '/plans', component: PlansView },
    { path: '/profiling-qa', component: ProfilingQAView },
    { path: '/completion', component: CompletionView },
    { path: '/organization', component: OrganizationView },
    { path: '/reports', component: ReportsView },
    { path: '/issues', component: IssuesView },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (!auth.initialized) await auth.initializeAuth();

  const isPublic = Boolean(to.meta.public);
  const isAuthOnly = Boolean(to.meta.authOnly);

  if (!isPublic && !auth.isAuthenticated) {
    return { path: '/sign-in', query: { redirect: to.fullPath } };
  }

  if (isAuthOnly && auth.isAuthenticated) {
    return '/';
  }

  return true;
});
