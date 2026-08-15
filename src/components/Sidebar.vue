<template>
  <aside class="hidden md:flex w-64 shrink-0 bg-slate-900 border border-slate-800 rounded-2xl text-slate-200 select-none flex-col h-full min-h-full overflow-hidden shadow-xl">
    <!-- Top Header -->
    <div class="p-4 border-b border-slate-800 flex items-center justify-between">
      <div class="flex items-center gap-2 min-w-0">
        <img
          :src="schemaStore.logoUrl"
          alt="System Logo"
          class="w-5 h-5 object-contain shrink-0"
        />
        <span class="font-bold text-sm tracking-wide text-slate-100 truncate">
          {{ schemaStore.activeLocale === 'fa' ? 'ماژول‌های اسکیما' : 'Registered Entities' }}
        </span>
      </div>
      <span class="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-500/20 shrink-0">
        {{ visibleResources.length }}
      </span>
    </div>

    <!-- Scrollable Navigation Groups -->
    <div class="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
      <div v-for="(items, groupTitle) in groups" :key="groupTitle" class="space-y-1">
        <!-- Collapsible Group Header -->
        <button
          type="button"
          @click="toggleGroup(String(groupTitle))"
          class="w-full flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/50 transition-colors group/hdr cursor-pointer"
        >
          <span class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-500/80 group-hover/hdr:bg-indigo-400" />
            {{ groupTitle }}
          </span>
          <ChevronDown
            :class="[
              'w-3.5 h-3.5 text-slate-400 transition-transform duration-200',
              collapsedGroups[groupTitle] ? '-rotate-90 rtl:rotate-90' : 'rotate-0'
            ]"
          />
        </button>

        <!-- Group Items -->
        <div v-if="!collapsedGroups[groupTitle]" class="space-y-1 pt-0.5">
          <button
            v-for="res in items"
            :key="res.name"
            type="button"
            @click="schemaStore.setActiveResource(res.name)"
            :class="[
              'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer',
              schemaStore.activeResourceName === res.name || schemaStore.activeResourceName === res.plural_name
                ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-600/20 font-semibold ring-1 ring-indigo-400/30'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            ]"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <component
                :is="getIconComponent(res.icon)"
                :class="[
                  'w-4 h-4 shrink-0',
                  schemaStore.activeResourceName === res.name || schemaStore.activeResourceName === res.plural_name ? 'text-indigo-200' : 'text-slate-400'
                ]"
              />
              <span class="truncate">{{ resolveLabel(res.title, schemaStore.activeLocale) }}</span>
            </div>

            <span
              v-if="schemaStore.activeResourceName === res.name || schemaStore.activeResourceName === res.plural_name"
              class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"
            />
          </button>
        </div>
      </div>

      <div v-if="visibleResources.length === 0" class="p-4 text-center text-xs text-slate-400 bg-slate-800/40 rounded-xl border border-slate-800 flex flex-col items-center gap-2">
        <p>{{ schemaStore.activeLocale === 'fa' ? 'هیچ ماژولی مجاز نیست' : 'No entities accessible' }}</p>
      </div>
    </div>

    <!-- Footer Info Bar -->
    <div class="p-3 border-t border-slate-800 bg-slate-950/50 text-[11px] text-slate-400 flex items-center justify-between">
      <span class="flex items-center gap-1.5">
        <FileText class="w-3.5 h-3.5 text-slate-400" />
        {{ schemaStore.activeLocale === 'fa' ? 'پروتکل سیمرغ' : 'Simurgh Protocol' }} v{{ schemaStore.schema?.$schema_version || '1.6.0' }}
      </span>
      <span class="text-[10px] text-emerald-400 font-mono">OK</span>
    </div>
  </aside>

  <!-- Mobile Drawer Overlay -->
  <div v-if="uiStore.isSidebarMobileOpen" class="fixed inset-0 z-50 flex md:hidden">
    <div
      class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      @click="uiStore.isSidebarMobileOpen = false"
    />
    <div class="relative z-10 w-64 h-full bg-slate-900 border-l border-r border-slate-800 text-slate-200 flex flex-col">
      <!-- Top Header -->
      <div class="p-4 border-b border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Database class="w-5 h-5 text-indigo-400" />
          <span class="font-bold text-sm tracking-wide text-slate-100">
            {{ schemaStore.activeLocale === 'fa' ? 'ماژول‌های اسکیما' : 'Registered Entities' }}
          </span>
        </div>
        <button
          type="button"
          @click="uiStore.isSidebarMobileOpen = false"
          class="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Navigation Items -->
      <div class="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
        <div v-for="(items, groupTitle) in groups" :key="groupTitle" class="space-y-1">
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
            {{ groupTitle }}
          </div>
          <button
            v-for="res in items"
            :key="res.name"
            type="button"
            @click="schemaStore.setActiveResource(res.name); uiStore.isSidebarMobileOpen = false;"
            :class="[
              'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer',
              schemaStore.activeResourceName === res.name || schemaStore.activeResourceName === res.plural_name
                ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-600/20 font-semibold ring-1 ring-indigo-400/30'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            ]"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <component :is="getIconComponent(res.icon)" class="w-4 h-4 text-slate-400" />
              <span class="truncate">{{ resolveLabel(res.title, schemaStore.activeLocale) }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSchemaStore } from '../stores/schema';
import { useUiStore } from '../stores/ui';
import { resolveLabel } from '../utils/resolveLabel';
import { ResourceMeta } from '../types/schema';
import * as LucideIcons from 'lucide-vue-next';
import {
  Layers
} from 'lucide-vue-next';

const schemaStore = useSchemaStore();
const uiStore = useUiStore();

const collapsedGroups = ref<Record<string, boolean>>({});

function toggleGroup(groupTitle: string) {
  collapsedGroups.value[groupTitle] = !collapsedGroups.value[groupTitle];
}

const visibleResources = computed<ResourceMeta[]>(() => {
  return schemaStore.sidebarResources.sort((a, b) => (a.order || 0) - (b.order || 0));
});

const groups = computed<Record<string, ResourceMeta[]>>(() => {
  const acc: Record<string, ResourceMeta[]> = {};
  visibleResources.value.forEach(res => {
    const groupName = res.group ? resolveLabel(res.group, schemaStore.activeLocale) : (schemaStore.activeLocale === 'fa' ? 'عمومی' : 'General');
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(res);
  });
  return acc;
});

function getIconComponent(iconName?: string) {
  if (!iconName) return Layers;
  
  // Convert kebab-case or lowercase to PascalCase (e.g. 'file-text' -> 'FileText', 'user' -> 'User')
  const pascalName = iconName
    .split(/[-_]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');

  const iconComp = (LucideIcons as Record<string, any>)[pascalName];
  if (iconComp) return iconComp;

  // Keyword fallbacks
  const name = iconName.toLowerCase();
  if (name.includes('newspaper') || name.includes('article') || name.includes('news')) return LucideIcons.Newspaper || Layers;
  if (name.includes('user') || name.includes('people')) return LucideIcons.Users || Layers;
  if (name.includes('tag')) return LucideIcons.Tags || Layers;
  if (name.includes('package')) return LucideIcons.Package || Layers;
  if (name.includes('headphone') || name.includes('ticket') || name.includes('support')) return LucideIcons.Headphones || Layers;

  return Layers;
}
</script>