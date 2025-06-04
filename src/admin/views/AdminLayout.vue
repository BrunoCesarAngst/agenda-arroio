<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
      <div class="flex items-center justify-center h-16 border-b">
        <h1 class="text-xl font-bold text-gray-800">Painel Admin</h1>
      </div>
      <nav class="mt-6">
        <router-link
          v-for="item in navigationItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
          :class="{ 'bg-gray-100': isCurrentRoute(item.path) }"
        >
          <component :is="item.icon" class="w-5 h-5 mr-3" />
          {{ item.name }}
        </router-link>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="ml-64 p-6">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">{{ currentPageTitle }}</h2>
      </div>
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
import {
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'AdminLayout',

  setup() {
    const route = useRoute();

    const navigationItems = [
      {
        name: 'Métricas',
        path: '/admin/metrics',
        icon: ChartBarIcon
      },
      {
        name: 'Usuários',
        path: '/admin/users',
        icon: UserGroupIcon
      },
      {
        name: 'Configurações',
        path: '/admin/settings',
        icon: CogIcon
      },
      {
        name: 'Logs',
        path: '/admin/logs',
        icon: DocumentTextIcon
      }
    ];

    const currentPageTitle = computed(() => {
      const currentRoute = route.matched[route.matched.length - 1];
      return currentRoute?.meta?.title || 'Painel Admin';
    });

    const isCurrentRoute = (path) => {
      return route.path.startsWith(path);
    };

    return {
      navigationItems,
      currentPageTitle,
      isCurrentRoute
    };
  }
};
</script>

<style scoped>
.admin-layout {
  @apply min-h-screen bg-gray-100;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors;
}
</style>