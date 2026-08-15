<template>
  <Teleport to="body" :disabled="!isFullscreen">
    <div :class="[isFullscreen ? 'fixed inset-0 z-[9999] bg-slate-950 p-4 md:p-6 overflow-y-auto w-full h-full flex flex-col items-center justify-start font-sans' : 'w-full max-w-full space-y-4 flex-1 flex flex-col']" :dir="schemaStore.direction">
      <div :class="[isFullscreen ? 'w-full max-w-7xl space-y-4 flex flex-col flex-1 mx-auto' : 'w-full max-w-full space-y-4 flex-1 flex flex-col']">
        <!-- Resource Toolbar Container Card -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4 shrink-0 max-w-full">
      <!-- Right side (RTL): Resource Title & Badge & Subtitle -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
          <LayoutGrid class="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="font-bold text-base sm:text-lg text-slate-100 tracking-tight flex items-center gap-2">
              <span>{{ titleText }}</span>
              <span class="text-xs font-normal bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700 font-mono">
                {{ pagination.total }} {{ schemaStore.activeLocale === 'fa' ? 'رکورد' : 'Records' }}
              </span>
              <span v-if="isFullscreen" class="text-[10px] font-semibold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/80">
                {{ schemaStore.activeLocale === 'fa' ? 'حالت تمام‌صفحه' : 'Full Screen' }}
              </span>
            </h2>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">
            {{ schemaStore.activeLocale === 'fa' ? `مدیریت پویا بر اساس اسکیمای v${schemaStore.schema?.$schema_version || '1.6.0'}` : 'Dynamic Management Grid' }}
          </p>
        </div>
      </div>

      <!-- Left side (RTL): Search & Actions -->
      <div class="flex flex-wrap items-center gap-2.5 max-w-full">
        <!-- Live Search Input -->
        <div v-if="searchableFields.length > 0" class="relative w-full sm:w-64 shrink-0">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3" />
          <input
            type="text"
            v-model="searchQuery"
            @input="debouncedFetch"
            :placeholder="searchPlaceholderText"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors pl-9 rtl:pl-3 rtl:pr-9 font-sans"
          />
          <button
            v-if="searchQuery"
            type="button"
            @click="searchQuery = ''; debouncedFetch()"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white rtl:right-auto rtl:left-2.5 cursor-pointer"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Fullscreen Toggle Button -->
        <button
          type="button"
          @click="isFullscreen = !isFullscreen"
          class="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/60 transition-colors text-xs cursor-pointer shrink-0"
          :title="isFullscreen ? (schemaStore.activeLocale === 'fa' ? 'خروج از حالت تمام صفحه' : 'Normal View') : (schemaStore.activeLocale === 'fa' ? 'تمام صفحه' : 'Fullscreen Width')"
        >
          <Minimize2 v-if="isFullscreen" class="w-4 h-4 text-indigo-300" />
          <Maximize2 v-else class="w-4 h-4 text-indigo-400" />
        </button>

        <!-- Filter Dropdown Toggle Button -->
        <div v-if="props.resource?.filterable_fields?.length" class="relative shrink-0">
          <button
            type="button"
            @click="isFilterMenuOpen = !isFilterMenuOpen"
            class="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/60 transition-colors cursor-pointer"
            :title="schemaStore.activeLocale === 'fa' ? 'فیلترها' : 'Filters'"
          >
            <FilterIcon class="w-4 h-4 text-slate-300" />
          </button>

          <!-- Filter Popover -->
          <div
            v-if="isFilterMenuOpen"
            class="absolute top-full mt-2 right-0 rtl:right-0 rtl:left-auto ltr:right-0 ltr:left-auto z-50 w-64 max-w-[calc(100vw-2.5rem)] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 space-y-3 backdrop-blur-md"
          >
            <div class="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-200">
              <span>{{ schemaStore.activeLocale === 'fa' ? 'فیلتر نتایج' : 'Filter Results' }}</span>
              <button type="button" @click="isFilterMenuOpen = false" class="text-slate-500 hover:text-white cursor-pointer">
                <X class="w-3.5 h-3.5" />
              </button>
            </div>

            <div class="max-h-60 overflow-y-auto custom-scrollbar space-y-3 py-1">
              <div v-for="fName in props.resource.filterable_fields" :key="fName">
                <label class="block text-[11px] font-medium text-slate-400 mb-1">
                  {{ resolveLabel(props.resource.fields.find(f => f.name === fName)?.label || fName, schemaStore.activeLocale) }}
                </label>
                <input
                  type="text"
                  v-model="filterState[fName]"
                  class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
            
            <div class="pt-2 border-t border-slate-800 flex justify-end gap-2">
              <button type="button" @click="clearFilters" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] cursor-pointer">
                {{ schemaStore.activeLocale === 'fa' ? 'پاک کردن' : 'Clear' }}
              </button>
              <button type="button" @click="applyFilters" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] cursor-pointer">
                {{ schemaStore.activeLocale === 'fa' ? 'اعمال فیلتر' : 'Apply' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Column Visibility Toggle Icon Button -->
        <div class="relative shrink-0">
          <button
            type="button"
            @click="isColumnMenuOpen = !isColumnMenuOpen"
            class="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/60 transition-colors cursor-pointer"
            :title="schemaStore.activeLocale === 'fa' ? 'مدیریت ستون‌های جدول' : 'Toggle Columns'"
          >
            <SlidersHorizontal class="w-4 h-4 text-slate-300" />
          </button>

          <!-- Column Visibility Dropdown Popover -->
          <div
            v-if="isColumnMenuOpen"
            class="absolute top-full mt-2 right-0 rtl:right-0 rtl:left-auto ltr:right-0 ltr:left-auto z-50 w-56 max-w-[calc(100vw-2.5rem)] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 space-y-2 backdrop-blur-md"
          >
            <div class="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-200">
              <span>{{ schemaStore.activeLocale === 'fa' ? 'نمایش ستون‌ها' : 'Visible Columns' }}</span>
              <button type="button" @click="isColumnMenuOpen = false" class="text-slate-500 hover:text-white cursor-pointer">
                <X class="w-3.5 h-3.5" />
              </button>
            </div>

            <div class="max-h-60 overflow-y-auto custom-scrollbar space-y-1.5 py-1">
              <label
                v-for="field in allTableFields"
                :key="field.name"
                class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer text-xs text-slate-300 select-none"
              >
                <input
                  type="checkbox"
                  :value="field.name"
                  v-model="visibleColumnNames"
                  class="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span>{{ resolveLabel(field.label, schemaStore.activeLocale) }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Export CSV Icon Button -->
        <button
          v-if="resource?.permissions?.can_export !== false"
          type="button"
          @click="handleExportClick"
          :disabled="isExporting"
          class="p-2.5 bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-400 border border-emerald-500/30 rounded-xl transition-all cursor-pointer shadow-sm shrink-0 disabled:opacity-50"
          :title="schemaStore.activeLocale === 'fa' ? 'خروجی CSV' : 'Export CSV'"
        >
          <Download v-if="!isExporting" class="w-4 h-4 text-emerald-400" />
          <svg v-else class="animate-spin w-4 h-4 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </button>

        <!-- Create New Item Icon Button -->
        <button
          v-if="resource?.permissions?.can_insert !== false"
          type="button"
          @click="emit('open-form', null)"
          class="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
          :title="schemaStore.activeLocale === 'fa' ? 'افزودن جدید' : 'Add Record'"
        >
          <Plus class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Data Table Container -->
    <div class="bg-slate-900/90 border border-slate-800/90 rounded-2xl shadow-xl max-w-full overflow-hidden">
      <div
        class="custom-scrollbar w-full block"
        :class="[visibleTableFields.length > 5 ? 'overflow-x-auto' : 'overflow-x-hidden']"
      >
        <table
          class="w-full text-right rtl:text-right ltr:text-left text-xs text-slate-300 table-auto"
          :class="[visibleTableFields.length > 5 ? 'min-w-[950px]' : 'w-full']"
        >
          <!-- Table Header -->
          <thead class="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 select-none">
            <tr>
              <!-- Accordion Toggle Header Column -->
              <th v-if="accordionField" class="w-10 px-3 py-3.5 text-center bg-slate-950/90">
                <span class="sr-only">Accordion Toggle</span>
              </th>

              <th
                v-for="field in visibleTableFields"
                :key="field.name"
                class="px-4 py-3.5 whitespace-nowrap bg-slate-950/90"
              >
                <div
                  v-if="isSortable(field.name)"
                  @click.stop="handleSort(field.name)"
                  class="inline-flex items-center gap-1.5 whitespace-nowrap hover:text-white transition-colors cursor-pointer select-none"
                >
                  <span>{{ resolveLabel(field.label, schemaStore.activeLocale) }}</span>
                  <ArrowUpDown class="w-3.5 h-3.5 text-indigo-400/80 shrink-0" />
                </div>
                <span v-else>{{ resolveLabel(field.label, schemaStore.activeLocale) }}</span>
              </th>

              <!-- Actions Sticky Column -->
              <th class="sticky left-0 rtl:left-0 ltr:right-0 z-20 bg-slate-950 text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-800 border-r border-slate-800/80 px-4 py-3.5 text-center whitespace-nowrap shadow-xl">
                {{ schemaStore.activeLocale === 'fa' ? 'عملیات' : 'Actions' }}
              </th>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody class="divide-y divide-slate-800/60">
            <!-- Loading Skeleton state -->
            <tr v-if="loading" v-for="i in 5" :key="'skel-' + i" class="animate-pulse">
              <td v-if="accordionField" class="px-3 py-4 text-center">
                <div class="h-3.5 w-3.5 bg-slate-800 rounded mx-auto" />
              </td>
              <td v-for="j in visibleTableFields.length" :key="'cell-' + j" class="px-4 py-4">
                <div class="h-3.5 bg-slate-800 rounded-md w-3/4" />
              </td>
              <td class="sticky left-0 rtl:left-0 ltr:right-0 z-10 bg-slate-950 px-4 py-4">
                <div class="h-3.5 bg-slate-800 rounded-md w-12 mx-auto" />
              </td>
            </tr>

            <!-- Empty Data state -->
            <tr v-else-if="records.length === 0">
              <td :colspan="visibleTableFields.length + (accordionField ? 2 : 1)" class="px-4 py-12 text-center text-slate-500">
                <div class="max-w-xs mx-auto space-y-2">
                  <p class="font-medium text-slate-400">
                    {{ schemaStore.activeLocale === 'fa' ? 'هیچ رکوردی یافت نشد' : 'No records match your query' }}
                  </p>
                </div>
              </td>
            </tr>

            <!-- Render Data Rows & Accordion Drawers -->
            <template v-else v-for="row in records" :key="row.id">
              <tr
                class="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                @click="toggleRowExpand(row.id)"
              >
                <!-- Accordion Toggle Button Cell -->
                <td v-if="accordionField" class="px-3 py-3.5 text-center" @click.stop>
                  <button
                    type="button"
                    @click="toggleRowExpand(row.id)"
                    class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    :title="expandedRowId === row.id ? 'Collapse Details' : 'Expand Details'"
                  >
                    <ChevronUp v-if="expandedRowId === row.id" class="w-4 h-4 text-indigo-400" />
                    <ChevronDown v-else class="w-4 h-4 text-slate-400" />
                  </button>
                </td>

                <td
                  v-for="field in visibleTableFields"
                  :key="field.name"
                  class="px-4 py-3.5 whitespace-nowrap max-w-xs truncate align-middle"
                >
                  <!-- Render category / relation array tags -->
                  <template v-if="field.name.includes('cat') || field.name.includes('tag') || (field.form_type as string) === 'multiselect' || (field.form_type as string) === 'select_multi' || (field.display_as as string) === 'tags' || Array.isArray(row[field.name])">
                    <div class="flex flex-col items-start gap-1 py-0.5">
                      <span
                        v-for="(tag, tIdx) in getTagItems(field, row[field.name], row)"
                        :key="tIdx"
                        :class="[
                          'inline-block px-2.5 py-1 text-[11px] font-medium rounded-xl border shadow-sm leading-tight text-center whitespace-nowrap',
                          getTagColorClass(tag, tIdx)
                        ]"
                      >
                        {{ tag }}
                      </span>
                    </div>
                  </template>

                  <!-- Render boolean switch badge -->
                  <template v-else-if="field.type === 'boolean' || field.form_type === 'switch'">
                    <span
                      :class="[
                        'inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-medium border',
                        row[field.name]
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      ]"
                    >
                      <span :class="['w-1.5 h-1.5 rounded-full', row[field.name] ? 'bg-emerald-400' : 'bg-rose-400']" />
                      {{ row[field.name]
                        ? (schemaStore.activeLocale === 'fa' ? 'فعال' : 'Active')
                        : (schemaStore.activeLocale === 'fa' ? 'غیرفعال' : 'Inactive') }}
                    </span>
                  </template>

                  <!-- Render badge for select options -->
                  <template v-else-if="field.display_as === 'badge'">
                    <span
                      v-if="row[field.name] !== null && row[field.name] !== undefined && row[field.name] !== ''"
                      :class="[
                        'inline-block px-2.5 py-1 text-xs font-medium rounded-full border shadow-sm',
                        getTagColorClass(getOptionLabel(field, row[field.name]))
                      ]"
                    >
                      {{ getOptionLabel(field, row[field.name]) }}
                    </span>
                    <span v-else class="text-slate-600 text-xs italic">-</span>
                  </template>

                  <!-- Render link -->
                  <template v-else-if="field.display_as === 'link'">
                    <a
                      v-if="row[field.name]"
                      :href="row[field.name]"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors flex items-center gap-1 w-max"
                      @click.stop
                    >
                      <Link2 class="w-3.5 h-3.5" />
                      {{ row[field.name].length > 30 ? row[field.name].substring(0, 30) + '...' : row[field.name] }}
                    </a>
                    <span v-else class="text-slate-600 text-[11px] italic">-</span>
                  </template>

                  <!-- Image preview -->
                  <template v-else-if="field.form_type === 'image_single' || field.form_type === 'image_multi'">
                    <div class="flex items-center gap-1.5">
                      <div
                        v-if="row[field.name]"
                        class="w-8 h-8 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0"
                      >
                        <img :src="getSingleImageSrc(row[field.name])" alt="Thumbnail" loading="lazy" class="w-full h-full object-cover" />
                      </div>
                      <span v-else class="text-slate-600 italic text-[11px]">-</span>
                    </div>
                  </template>

                  <!-- Default field text render -->
                  <template v-else>
                    <span class="text-slate-200">{{ formatCellValue(field, row[field.name]) }}</span>
                  </template>
                </td>

                <!-- Actions column (Fixed / Sticky on Left Edge) -->
                <td
                  class="sticky left-0 rtl:left-0 ltr:right-0 z-10 bg-slate-900 group-hover:bg-slate-800 transition-colors border-r border-slate-800 px-4 py-3.5 text-center whitespace-nowrap shadow-xl"
                  @click.stop
                >
                  <div
                    class="gap-1.5"
                    style="display: flex !important; flex-direction: row !important; flex-wrap: nowrap !important; align-items: center !important; justify-content: center !important;"
                  >
                    <button
                      v-if="resource?.permissions?.can_edit !== false"
                      type="button"
                      @click="emit('open-form', row)"
                      class="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/20 text-slate-400 hover:text-indigo-300 border border-slate-700 transition-colors cursor-pointer shrink-0"
                      :title="schemaStore.activeLocale === 'fa' ? 'ویرایش رکورد' : 'Edit Record'"
                    >
                      <Edit2 class="w-3.5 h-3.5" />
                    </button>

                    <button
                      v-if="resource?.permissions?.can_delete !== false"
                      type="button"
                      @click="handleDelete(row)"
                      class="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/20 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors cursor-pointer shrink-0"
                      :title="schemaStore.activeLocale === 'fa' ? 'حذف رکورد' : 'Delete Record'"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Accordion Detail Drawer Row -->
              <tr v-if="accordionField && expandedRowId === row.id" :id="`accordion-${row.id}`" class="bg-slate-950/70 border-b border-slate-800">
                <td :colspan="visibleTableFields.length + 2" class="p-4">
                  <div class="space-y-4 bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-inner">
                    <!-- Accordion Content Header -->
                    <h4 class="font-semibold text-xs text-indigo-300 flex items-center gap-1.5">
                      <span class="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <span>{{ resolveLabel(accordionField.label, schemaStore.activeLocale) }}</span>
                    </h4>

                    <!-- Accordion Body Text / WYSIWYG Content -->
                    <div class="text-slate-200">
                      <div
                        v-if="accordionField.form_type === 'wysiwyg'"
                        class="prose prose-invert prose-xs max-w-none text-slate-200 leading-relaxed font-sans"
                        v-html="DOMPurify.sanitize(row[accordionField.name] || '')"
                      />
                      <div v-else class="text-xs text-slate-300 leading-relaxed">
                        {{ row[accordionField.name] || '-' }}
                      </div>
                    </div>

                    <!-- Image Gallery Section -->
                    <div
                      v-if="getImageListFromRow(row).length > 0"
                      class="mt-6 pt-4 border-t border-slate-800/80"
                    >
                      <h5 class="font-semibold text-xs text-emerald-400 flex items-center gap-1.5 mb-4 pb-1">
                        <ImageIcon class="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{{ schemaStore.activeLocale === 'fa' ? 'گالری تصاویر و فایل‌های پیوست' : 'Image Gallery' }}</span>
                      </h5>
                      <div class="flex flex-wrap gap-3 mt-3">
                        <div
                          v-for="(imgUrl, idx) in getImageListFromRow(row)"
                          :key="idx"
                          @click="lightboxImage = imgUrl"
                          class="relative group rounded-xl overflow-hidden border border-slate-700 w-32 h-24 cursor-pointer shadow-md hover:border-emerald-500 transition-all hover:scale-105 bg-slate-950"
                        >
                          <img :src="imgUrl" alt="Gallery item" loading="lazy" class="w-full h-full object-cover" />
                          <div v-if="idx === 0 && row.cover_image" class="absolute top-1 right-1 bg-emerald-600 text-[9px] text-white px-1.5 py-0.5 rounded font-bold shadow-sm">
                            {{ schemaStore.activeLocale === 'fa' ? 'تصویر اصلی' : 'Cover' }}
                          </div>
                          <div class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye class="w-5 h-5 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Audit Metadata Footer -->
                    <div v-if="props.resource?.audit_fields" class="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2 font-mono">
                      <div class="flex items-center gap-3">
                        <span class="flex items-center gap-1">
                          <User class="w-3.5 h-3.5" />
                          {{ schemaStore.activeLocale === 'fa' ? 'ایجاد:' : 'Created by:' }} {{ row.created_by || row.audit_fields?.created_by || '-' }}
                        </span>
                        <span class="flex items-center gap-1">
                          <Edit2 class="w-3.5 h-3.5" />
                          {{ schemaStore.activeLocale === 'fa' ? 'ویرایش:' : 'Updated by:' }} {{ row.updated_by || row.audit_fields?.updated_by || '-' }}
                        </span>
                      </div>
                      <div class="flex items-center gap-1.5 opacity-80">
                        <Clock class="w-3 h-3" />
                        <span>
                          {{ schemaStore.activeLocale === 'fa' ? 'زمان:' : 'Date:' }} {{ row.created_at || row.updated_at || row.audit_fields?.created_at || '-' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Table Pagination Footer -->
      <div class="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-400">
        <div class="flex items-center gap-3">
          <span>
            {{ schemaStore.activeLocale === 'fa' ? 'صفحه' : 'Page' }} {{ pagination.current_page }} {{ schemaStore.activeLocale === 'fa' ? 'از' : 'of' }} {{ pagination.last_page }}
          </span>

          <!-- Per Page Selector Dropdown (10, 20, 50) -->
          <div class="flex items-center gap-1.5 border-r border-slate-800 pr-3 rtl:border-r rtl:border-slate-800 rtl:pr-3 ltr:border-l ltr:border-slate-800 ltr:pl-3">
            <span class="text-slate-400 font-medium">
              {{ schemaStore.activeLocale === 'fa' ? 'تعداد نمایش:' : 'Per page:' }}
            </span>
            <select
              :value="pagination.per_page"
              @change="handlePerPageChange"
              class="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer font-mono shadow-sm"
            >
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <button
            type="button"
            @click="handlePageChange(pagination.current_page - 1)"
            :disabled="pagination.current_page <= 1"
            class="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 cursor-pointer flex items-center gap-1"
          >
            <ChevronRight v-if="schemaStore.direction === 'rtl'" class="w-3.5 h-3.5" />
            <ChevronLeft v-else class="w-3.5 h-3.5" />
            <span>{{ schemaStore.activeLocale === 'fa' ? 'قبلی' : 'Prev' }}</span>
          </button>

          <button
            type="button"
            @click="handlePageChange(pagination.current_page + 1)"
            :disabled="pagination.current_page >= pagination.last_page"
            class="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 cursor-pointer flex items-center gap-1"
          >
            <span>{{ schemaStore.activeLocale === 'fa' ? 'بعدی' : 'Next' }}</span>
            <ChevronLeft v-if="schemaStore.direction === 'rtl'" class="w-3.5 h-3.5" />
            <ChevronRight v-else class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Image Lightbox Modal Dialog -->
    <Teleport to="body">
      <div v-if="lightboxImage" dir="ltr" class="fixed inset-0 z-[999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4" @click="lightboxImage = null">
        <div class="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center" @click.stop>
          <img :src="lightboxImage" alt="Enlarged view" class="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-slate-700" />
          <button type="button" @click="lightboxImage = null" class="absolute -top-4 -right-4 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full border border-slate-600 shadow-lg cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>
    </Teleport>

    <!-- CSV Field Selection Export Modal -->
    <ExportCsvModal
      v-model="isExportModalOpen"
      :resource="(resource as any)"
      :records="exportRecords"
    />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import DOMPurify from 'dompurify';
import { useSchemaStore } from '../stores/schema';
import { useUiStore } from '../stores/ui';
import { resolveLabel } from '../utils/resolveLabel';
import { ResourceMeta, FieldMeta } from '../types/schema';
import { adminApi } from '../services/api';
import { parseAnyTimestampToDate, gregorianToJalali } from '../utils/jalali';
import ExportCsvModal from './ExportCsvModal.vue';
import {
  LayoutGrid,
  Search,
  Plus,
  Download,
  ArrowUpDown,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
  Eye,
  User,
  ShieldCheck,
  Clock,
  X,
  SlidersHorizontal,
  Link2,
  Filter as FilterIcon
} from 'lucide-vue-next';

const props = defineProps<{
  resource: ResourceMeta | null;
}>();

const emit = defineEmits<{
  (e: 'open-form', record: any | null): void;
}>();

const schemaStore = useSchemaStore();
const uiStore = useUiStore();

const records = ref<any[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const currentSort = ref('');
const isFullscreen = ref(false);
const expandedRowId = ref<any | null>(null);
const lightboxImage = ref<string | null>(null);
const isExportModalOpen = ref(false);
const isColumnMenuOpen = ref(false);
const isFilterMenuOpen = ref(false);
const filterState = ref<Record<string, any>>({});
const visibleColumnNames = ref<string[]>([]);
const exportRecords = ref<any[]>([]);
const isExporting = ref(false);

const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0
});

const titleText = computed(() => {
  return props.resource ? resolveLabel(props.resource.title, schemaStore.activeLocale) : '';
});

const accordionField = computed<FieldMeta | undefined>(() => {
  if (!props.resource) return undefined;
  return props.resource.fields.find(f => f.accordion) || props.resource.fields.find(f => f.form_type === 'wysiwyg');
});

const allTableFields = computed<FieldMeta[]>(() => {
  if (!props.resource) return [];
  return props.resource.fields.filter(f => !f.hidden_in_table);
});

const visibleTableFields = computed<FieldMeta[]>(() => {
  if (!props.resource) return [];
  return props.resource.fields
    .filter(f => !f.hidden_in_table && visibleColumnNames.value.includes(f.name))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
});

const searchableFields = computed<string[]>(() => {
  return props.resource?.searchable_fields || [];
});

const searchPlaceholderText = computed(() => {
  if (!props.resource) return '';
  const isFa = schemaStore.activeLocale === 'fa';
  const rawFields = props.resource.searchable_fields || [];
  if (rawFields.length === 0) {
    return isFa ? 'جستجو...' : 'Search...';
  }

  const localizedFieldLabels = rawFields.map(fName => {
    const fieldObj = props.resource?.fields.find(f => f.name === fName);
    return fieldObj ? resolveLabel(fieldObj.label, schemaStore.activeLocale) : fName;
  });

  const separator = isFa ? '، ' : ', ';
  const prefix = isFa ? 'جستجو در ' : 'Search in ';
  return `${prefix}${localizedFieldLabels.join(separator)}...`;
});

function isSortable(fieldName: string): boolean {
  return props.resource?.sortable_fields?.includes(fieldName) ?? false;
}

function getOptionLabel(field: FieldMeta, val: any): string {
  if (!field.options) return String(val ?? '-');
  const opt = field.options.find(o => String(o.value) === String(val));
  return opt ? resolveLabel(opt.label, schemaStore.activeLocale) : String(val ?? '-');
}

function getTagItems(field: FieldMeta, val: any, row?: any): string[] {
  // 1. Check relation display key on row e.g. categories_display, category_ids_display
  const displayKey = field.relation?.display_key || `${field.name}_display`;
  if (row && row[displayKey]) {
    const displayVal = row[displayKey];
    if (Array.isArray(displayVal)) {
      return displayVal.map(v => (typeof v === 'object' && v !== null ? resolveLabel(v, schemaStore.activeLocale) : String(v)));
    }
    if (displayVal) return [typeof displayVal === 'object' && displayVal !== null ? resolveLabel(displayVal, schemaStore.activeLocale) : String(displayVal)];
  }

  if (row && row[`${field.name}_names`]) {
    const displayVal = row[`${field.name}_names`];
    if (Array.isArray(displayVal)) return displayVal.map(String);
  }

  // 2. Options check if defined
  if (field.options && field.options.length > 0) {
    if (Array.isArray(val)) {
      return val.map(v => getOptionLabel(field, v)).filter(Boolean);
    }
    return [getOptionLabel(field, val)];
  }

  if (val === null || val === undefined || val === '') return [];

  if (Array.isArray(val)) {
    return val.map(v => String(v));
  }

  if (typeof val === 'string' && val.includes(',')) {
    return val.split(',').map(s => s.trim());
  }

  return [String(val)];
}

const TAG_COLORS = [
  'bg-purple-500/20 text-purple-300 border-purple-500/40',
  'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'bg-rose-500/20 text-rose-300 border-rose-500/40',
  'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
  'bg-teal-500/20 text-teal-300 border-teal-500/40',
  'bg-pink-500/20 text-pink-300 border-pink-500/40'
];

const DIRECT_COLOR_MAP: Record<string, string> = {
  purple: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  amber: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  red: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  rose: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  green: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  yellow: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
  teal: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
  cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
};

function getTagColorClass(tag: any, idx: number = 0): string {
  const rawStr = String(tag || '').trim();
  const lowerStr = rawStr.toLowerCase();

  if (DIRECT_COLOR_MAP[lowerStr]) {
    return DIRECT_COLOR_MAP[lowerStr];
  }

  let hash = 0;
  for (let i = 0; i < rawStr.length; i++) {
    hash = (hash << 5) - hash + rawStr.charCodeAt(i);
    hash |= 0;
  }
  const colorIdx = Math.abs(hash + idx) % TAG_COLORS.length;
  return TAG_COLORS[colorIdx];
}

function getSingleImageSrc(val: any): string {
  if (Array.isArray(val) && val.length > 0) return val[0];
  if (typeof val === 'string') return val;
  return '';
}

function getImageListFromRow(row: any): string[] {
  const images: string[] = [];
  if (row.cover_image) images.push(row.cover_image);
  if (Array.isArray(row.gallery)) images.push(...row.gallery);
  if (Array.isArray(row.images)) images.push(...row.images);
  if (Array.isArray(row.attachments)) images.push(...row.attachments);
  return Array.from(new Set(images.filter(Boolean)));
}

function formatCellValue(field: FieldMeta, val: any): string {
  if (val === null || val === undefined || val === '') return '-';

  if (field.type === 'date' || field.form_type === 'date' || field.type === 'datetime' || field.form_type === 'datetime') {
    const d = parseAnyTimestampToDate(val);
    if (d && !isNaN(d.getTime())) {
      const isDatetime = field.type === 'datetime' || field.form_type === 'datetime';
      const pad = (n: number) => String(n).padStart(2, '0');
      const timePart = isDatetime ? ` - ${pad(d.getHours())}:${pad(d.getMinutes())}` : '';
      if (schemaStore.activeLocale === 'fa') {
        const j = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
        return `${j.jy}/${pad(j.jm)}/${pad(j.jd)}${timePart}`;
      } else {
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}${timePart}`;
      }
    }
  }

  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

let debounceTimer: any = null;
function debouncedFetch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchData(1);
  }, 400);
}

async function fetchData(page = 1) {
  if (!props.resource) return;
  loading.value = true;
  try {
    const res = await adminApi.getList(props.resource.api_path, {
      page,
      per_page: pagination.value.per_page,
      search: searchQuery.value,
      sort: currentSort.value,
      filter: Object.keys(filterState.value).length > 0 ? filterState.value : undefined
    });

    records.value = res.data || [];
    pagination.value = {
      current_page: res.meta?.page || 1,
      last_page: res.meta?.last_page || 1,
      per_page: res.meta?.per_page || 10,
      total: res.meta?.total || (res.data ? res.data.length : 0)
    };
  } catch (err: any) {
    uiStore.addToast('error', 'Data Error', err?.message || 'Failed to fetch table data');
  } finally {
    loading.value = false;
  }
}

async function handleExportClick() {
  if (!props.resource) return;
  isExporting.value = true;
  try {
    const res = await adminApi.getList(props.resource.api_path, {
      page: 1,
      per_page: 100000,
      search: searchQuery.value,
      sort: currentSort.value,
      filter: Object.keys(filterState.value).length > 0 ? filterState.value : undefined
    });
    exportRecords.value = res.data || [];
    isExportModalOpen.value = true;
  } catch (err: any) {
    uiStore.addToast('error', 'Export Failed', err?.message || 'Failed to fetch records for export');
  } finally {
    isExporting.value = false;
  }
}

function applyFilters() {
  isFilterMenuOpen.value = false;
  fetchData(1);
}

function clearFilters() {
  filterState.value = {};
  isFilterMenuOpen.value = false;
  fetchData(1);
}

function handleSort(fieldName: string) {
  if (!isSortable(fieldName)) return;
  expandedRowId.value = null;
  if (currentSort.value === fieldName) {
    currentSort.value = `-${fieldName}`;
  } else if (currentSort.value === `-${fieldName}`) {
    currentSort.value = '';
  } else {
    currentSort.value = fieldName;
  }
  fetchData(1);
}

function handlePageChange(newPage: number) {
  if (newPage < 1 || newPage > pagination.value.last_page) return;
  fetchData(newPage);
}

function handlePerPageChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  if (!target) return;
  const newPerPage = Number(target.value);
  pagination.value.per_page = newPerPage;
  fetchData(1);
}

function toggleRowExpand(rowId: any) {
  if (expandedRowId.value === rowId) {
    expandedRowId.value = null;
  } else {
    expandedRowId.value = rowId;
  }
}

async function handleDelete(row: any) {
  if (!props.resource || !confirm(schemaStore.activeLocale === 'fa' ? 'آیا از حذف این رکورد اطمینان دارید؟' : 'Are you sure you want to delete this record?')) {
    return;
  }
  try {
    await adminApi.deleteRecord(props.resource.api_path, row.id);
    uiStore.addToast(
      'success',
      schemaStore.activeLocale === 'fa' ? 'حذف موفق' : 'Deleted Successfully',
      schemaStore.activeLocale === 'fa' ? 'رکورد با موفقیت حذف گردید.' : 'Record deleted successfully'
    );
    fetchData(pagination.value.current_page);
  } catch (err: any) {
    uiStore.addToast('error', 'Delete Failed', err?.message || 'Failed to delete record');
  }
}

watch(
  () => props.resource,
  newRes => {
    if (newRes) {
      searchQuery.value = '';
      currentSort.value = newRes.default_sort || 'id';
      expandedRowId.value = null;
      isColumnMenuOpen.value = false;
      visibleColumnNames.value = newRes.fields.filter(f => !f.hidden_in_table).map(f => f.name);
      fetchData(1);
    }
  },
  { immediate: true }
);

function refresh() {
  fetchData(pagination.value.current_page);
}

defineExpose({
  refresh,
  fetchData
});
</script>
