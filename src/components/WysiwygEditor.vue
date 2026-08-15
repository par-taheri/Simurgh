<template>
  <div
    :class="[
      'border border-slate-800 bg-slate-950 shadow-2xl transition-all',
      isFullscreen
        ? 'fixed inset-0 z-[120] p-4 md:p-6 rounded-none min-h-screen border-0 overflow-hidden flex flex-col'
        : 'rounded-2xl overflow-visible relative'
    ]"
  >
    <!-- Top Bar: Mode Tabs (Visual / HTML Code / Live Preview) & Fullscreen -->
    <div class="bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center justify-between flex-wrap gap-2 rounded-t-2xl shrink-0">
      <div class="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          type="button"
          @click="mode = 'visual'"
          :class="[
            'px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
            mode === 'visual' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200'
          ]"
        >
          <Sparkles class="w-3.5 h-3.5 text-amber-300" />
          <span>{{ schemaStore.activeLocale === 'fa' ? 'ویرایش‌گر بصری (WYSIWYG)' : 'Visual Editor' }}</span>
        </button>

        <button
          type="button"
          @click="mode = 'code'"
          :class="[
            'px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
            mode === 'code' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200'
          ]"
        >
          <FileCode class="w-3.5 h-3.5" />
          <span>{{ schemaStore.activeLocale === 'fa' ? 'کد خام HTML' : 'HTML Code' }}</span>
        </button>

        <button
          type="button"
          @click="mode = 'preview'"
          :class="[
            'px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
            mode === 'preview' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200'
          ]"
        >
          <Eye class="w-3.5 h-3.5 text-emerald-400" />
          <span>{{ schemaStore.activeLocale === 'fa' ? 'پیش‌نمایش خروجی' : 'Live Preview' }}</span>
        </button>
      </div>

      <div class="flex items-center gap-2">
        <div class="text-[11px] font-mono text-slate-500 hidden md:block">
          Rich Visual Content Engine
        </div>
        <button
          type="button"
          @click="isFullscreen = !isFullscreen"
          :class="[
            'p-1.5 rounded-lg border transition-all shrink-0 flex items-center justify-center cursor-pointer',
            isFullscreen
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30 ring-2 ring-indigo-500/20'
              : 'bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
          ]"
          :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'"
        >
          <Minimize2 v-if="isFullscreen" class="w-4 h-4 text-indigo-100" />
          <Maximize2 v-else class="w-4 h-4 text-indigo-400" />
        </button>
      </div>
    </div>

    <!-- Main Formatting Toolbar (Visible in Visual Mode) -->
    <div v-if="mode === 'visual'" class="bg-slate-900/80 border-b border-slate-800 p-2 flex flex-wrap items-center gap-1 text-slate-300 relative z-20">
      <!-- Undo / Redo -->
      <button type="button" @click="execCmd('undo')" class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer" title="Undo">
        <Undo class="w-3.5 h-3.5" />
      </button>
      <button type="button" @click="execCmd('redo')" class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer" title="Redo">
        <Redo class="w-3.5 h-3.5" />
      </button>

      <div class="h-4 w-px bg-slate-800 mx-1" />

      <!-- Font Family Dropdown -->
      <div class="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
        <Type class="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <select
          v-model="currentFont"
          @focus="saveSelection"
          @mousedown="saveSelection"
          @change="applyFontFamily(currentFont)"
          class="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
          title="Font Family"
        >
          <option value="" disabled class="bg-slate-900">Font...</option>
          <option v-for="f in fontFamilies" :key="f.value" :value="f.value" class="bg-slate-900">
            {{ f.label }}
          </option>
        </select>
      </div>

      <!-- Font Size Dropdown -->
      <div class="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
        <select
          v-model="currentFontSize"
          @focus="saveSelection"
          @mousedown="saveSelection"
          @change="applyFontSize(currentFontSize)"
          class="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
          title="Font Size"
        >
          <option value="" disabled class="bg-slate-900">Size...</option>
          <option v-for="s in fontSizes" :key="s.value" :value="s.value" class="bg-slate-900">
            {{ s.label }}
          </option>
        </select>
      </div>

      <div class="h-4 w-px bg-slate-800 mx-1" />

      <!-- Inline Formatting Buttons -->
      <button
        type="button"
        @click="execCmd('bold')"
        :class="['p-1.5 rounded-lg transition-colors cursor-pointer', activeFormats.bold ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300 hover:text-white']"
        title="Bold"
      >
        <Bold class="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        @click="execCmd('italic')"
        :class="['p-1.5 rounded-lg transition-colors cursor-pointer', activeFormats.italic ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300 hover:text-white']"
        title="Italic"
      >
        <Italic class="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        @click="execCmd('underline')"
        :class="['p-1.5 rounded-lg transition-colors cursor-pointer', activeFormats.underline ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300 hover:text-white']"
        title="Underline"
      >
        <Underline class="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        @click="execCmd('strikeThrough')"
        :class="['p-1.5 rounded-lg transition-colors cursor-pointer', activeFormats.strikethrough ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300 hover:text-white']"
        title="Strikethrough"
      >
        <Strikethrough class="w-3.5 h-3.5" />
      </button>

      <div class="h-4 w-px bg-slate-800 mx-1" />

      <!-- Lists & Blockquote & Code Block -->
      <button
        type="button"
        @click="toggleBulletList"
        :class="['p-1.5 rounded-lg transition-colors cursor-pointer', activeFormats.unorderedList ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300 hover:text-white']"
        title="Unordered Bullet List"
      >
        <List class="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        @click="toggleOrderedList"
        :class="['p-1.5 rounded-lg transition-colors cursor-pointer', activeFormats.orderedList ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300 hover:text-white']"
        title="Ordered List"
      >
        <ListOrdered class="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        @click="execCmd('formatBlock', '<blockquote>')"
        class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
        title="Blockquote"
      >
        <Quote class="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        @click="insertCodeBlock"
        class="p-1.5 rounded-lg hover:bg-slate-800 text-amber-400 hover:text-amber-300 cursor-pointer"
        title="Code Block"
      >
        <Code class="w-3.5 h-3.5" />
      </button>

      <div class="h-4 w-px bg-slate-800 mx-1" />

      <!-- Text Alignment -->
      <button
        type="button"
        @click="execCmd('justifyRight')"
        :class="['p-1.5 rounded-lg transition-colors cursor-pointer', activeFormats.alignRight ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300 hover:text-white']"
        title="Right Align"
      >
        <AlignRight class="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        @click="execCmd('justifyCenter')"
        :class="['p-1.5 rounded-lg transition-colors cursor-pointer', activeFormats.alignCenter ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300 hover:text-white']"
        title="Center Align"
      >
        <AlignCenter class="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        @click="execCmd('justifyLeft')"
        :class="['p-1.5 rounded-lg transition-colors cursor-pointer', activeFormats.alignLeft ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300 hover:text-white']"
        title="Left Align"
      >
        <AlignLeft class="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        @click="execCmd('justifyFull')"
        :class="['p-1.5 rounded-lg transition-colors cursor-pointer', activeFormats.alignJustify ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300 hover:text-white']"
        title="Justify Align"
      >
        <AlignJustify class="w-3.5 h-3.5" />
      </button>

      <!-- Text Direction RTL / LTR Toggle -->
      <button
        type="button"
        @click="toggleTextDirection('rtl')"
        class="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-indigo-300 hover:text-white cursor-pointer"
        title="Set RTL Direction (فارسی)"
      >
        RTL
      </button>
      <button
        type="button"
        @click="toggleTextDirection('ltr')"
        class="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-emerald-300 hover:text-white cursor-pointer"
        title="Set LTR Direction (English / Code)"
      >
        LTR
      </button>

      <div class="h-4 w-px bg-slate-800 mx-1" />

      <!-- Text Color Picker -->
      <div class="relative color-picker-container">
        <button
          type="button"
          @mousedown="saveSelection"
          @click="isColorPickerOpen = !isColorPickerOpen; isHighlightPickerOpen = false;"
          class="p-1.5 rounded-lg hover:bg-slate-800 text-rose-400 hover:text-rose-300 cursor-pointer"
          title="Text Color"
        >
          <Palette class="w-3.5 h-3.5" />
        </button>

        <div v-if="isColorPickerOpen" class="absolute top-full right-0 rtl:right-0 ltr:left-0 mt-2 z-50 bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-2xl flex flex-col gap-2.5 w-52">
          <div class="text-[10px] text-slate-400 font-semibold px-1">
            {{ schemaStore.activeLocale === 'fa' ? 'رنگ متن' : 'Text Color' }}
          </div>
          <div class="grid grid-cols-4 gap-1.5">
            <button
              v-for="c in textColors"
              :key="c.hex"
              type="button"
              @mousedown="saveSelection"
              @click="applyTextColor(c.hex)"
              class="w-8 h-8 rounded-xl border border-slate-700 transition-transform hover:scale-110 shadow-sm cursor-pointer"
              :style="{ backgroundColor: c.hex }"
              :title="c.name"
            />
          </div>
          <div class="h-px bg-slate-800 my-0.5" />
          <div class="flex items-center justify-between gap-1.5">
            <button
              type="button"
              @mousedown="saveSelection"
              @click="applyTextColor('inherit')"
              class="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 border border-slate-700 cursor-pointer"
            >
              <RotateCcw class="w-3 h-3 text-slate-400" />
              <span>{{ schemaStore.activeLocale === 'fa' ? 'پیش‌فرض' : 'Default' }}</span>
            </button>
            <label class="px-2 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 relative overflow-hidden">
              <Pipette class="w-3 h-3 text-indigo-400" />
              <span>{{ schemaStore.activeLocale === 'fa' ? 'دلخواه' : 'Custom' }}</span>
              <input
                type="color"
                @mousedown="saveSelection"
                @change="(e: any) => { applyTextColor(e.target.value, false); isColorPickerOpen = false; }"
                class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </label>
          </div>
        </div>
      </div>

      <!-- Highlight Color Picker -->
      <div class="relative color-picker-container">
        <button
          type="button"
          @mousedown="saveSelection"
          @click="isHighlightPickerOpen = !isHighlightPickerOpen; isColorPickerOpen = false;"
          class="p-1.5 rounded-lg hover:bg-slate-800 text-amber-400 hover:text-amber-300 cursor-pointer"
          title="Highlight Color"
        >
          <Highlighter class="w-3.5 h-3.5" />
        </button>

        <div v-if="isHighlightPickerOpen" class="absolute top-full right-0 rtl:right-0 ltr:left-0 mt-2 z-50 bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-2xl flex flex-col gap-2.5 w-52">
          <div class="text-[10px] text-slate-400 font-semibold px-1">
            {{ schemaStore.activeLocale === 'fa' ? 'رنگ زمینه (هایلایت)' : 'Highlight Color' }}
          </div>
          <div class="grid grid-cols-3 gap-1.5">
            <button
              v-for="c in highlightColors"
              :key="c.hex"
              type="button"
              @mousedown="saveSelection"
              @click="applyHighlightColor(c.hex)"
              class="w-10 h-8 rounded-xl border border-slate-700 transition-transform hover:scale-110 shadow-sm cursor-pointer"
              :style="{ backgroundColor: c.hex }"
              :title="c.name"
            />
          </div>
          <div class="h-px bg-slate-800 my-0.5" />
          <div class="flex items-center justify-between gap-1.5">
            <button
              type="button"
              @mousedown="saveSelection"
              @click="applyHighlightColor('transparent')"
              class="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 border border-slate-700 cursor-pointer"
            >
              <RotateCcw class="w-3 h-3 text-slate-400" />
              <span>{{ schemaStore.activeLocale === 'fa' ? 'بدون رنگ' : 'Clear' }}</span>
            </button>
            <label class="px-2 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 relative overflow-hidden">
              <Pipette class="w-3 h-3 text-indigo-400" />
              <span>{{ schemaStore.activeLocale === 'fa' ? 'دلخواه' : 'Custom' }}</span>
              <input
                type="color"
                @mousedown="saveSelection"
                @change="(e: any) => { applyHighlightColor(e.target.value, false); isHighlightPickerOpen = false; }"
                class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </label>
          </div>
        </div>
      </div>

      <div class="h-4 w-px bg-slate-800 mx-1" />

      <!-- Table Generator & Clear Formatting & Media Modals -->
      <button
        type="button"
        @click="insertTable"
        class="p-1.5 rounded-lg hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1 text-xs font-medium"
        title="Insert Dynamic Table"
      >
        <span class="font-mono text-xs font-bold">[田]</span>
        <span class="hidden sm:inline text-[11px]">{{ schemaStore.activeLocale === 'fa' ? 'جدول' : 'Table' }}</span>
      </button>

      <button
        type="button"
        @click="execCmd('removeFormat')"
        class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        title="Remove Formatting"
      >
        <RemoveFormatting class="w-3.5 h-3.5" />
      </button>

      <div class="h-4 w-px bg-slate-800 mx-1" />

      <!-- Hyperlink Modal Trigger -->
      <button
        type="button"
        @click="openLinkModal"
        class="p-1.5 rounded-lg hover:bg-slate-800 text-sky-400 hover:text-sky-300 cursor-pointer flex items-center gap-1 text-xs font-medium"
        title="Insert Hyperlink"
      >
        <LinkIcon class="w-3.5 h-3.5" />
        <span class="hidden sm:inline text-[11px]">{{ schemaStore.activeLocale === 'fa' ? 'لینک' : 'Link' }}</span>
      </button>

      <!-- Image Modal Trigger -->
      <button
        type="button"
        @click="openImageModal"
        class="p-1.5 rounded-lg hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 cursor-pointer flex items-center gap-1 text-xs font-medium"
        title="Insert Image"
      >
        <ImageIcon class="w-3.5 h-3.5" />
        <span class="hidden sm:inline text-[11px]">{{ schemaStore.activeLocale === 'fa' ? 'عکس' : 'Image' }}</span>
      </button>
    </div>

    <!-- Selected Image Resize & Alignment Controls Banner -->
    <div
      v-if="mode === 'visual' && selectedImgElement"
      class="bg-slate-900 border-b border-indigo-500/50 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-200 shadow-inner"
    >
      <div class="flex items-center gap-2">
        <span class="flex items-center gap-1.5 font-bold text-indigo-400 text-[11px] bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">
          <Scaling class="w-3.5 h-3.5" />
          <span>{{ schemaStore.activeLocale === 'fa' ? 'تنظیمات تصویر انتخاب‌شده:' : 'Selected Image Tools:' }}</span>
        </span>

        <!-- Size Quick Selectors -->
        <div class="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            v-for="wStr in ['25%', '50%', '75%', '100%']"
            :key="wStr"
            type="button"
            @click="setResizeSelectedImage(wStr)"
            :class="[
              'px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-all cursor-pointer',
              selectedImgElement.style.width === wStr ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            ]"
          >
            {{ wStr }}
          </button>
        </div>

        <!-- Align Selectors -->
        <div class="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button type="button" @click="setAlignSelectedImage('right')" class="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer" title="Align Right">
            <AlignRight class="w-3.5 h-3.5" />
          </button>
          <button type="button" @click="setAlignSelectedImage('center')" class="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer" title="Align Center">
            <AlignCenter class="w-3.5 h-3.5" />
          </button>
          <button type="button" @click="setAlignSelectedImage('left')" class="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer" title="Align Left">
            <AlignLeft class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="deleteSelectedImage"
          class="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span>{{ schemaStore.activeLocale === 'fa' ? 'حذف تصویر' : 'Delete' }}</span>
        </button>

        <button
          type="button"
          @click="clearImageSelection"
          class="p-1 text-slate-400 hover:text-white cursor-pointer"
          title="Close Selection"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Visual Editor Area (contentEditable) -->
    <div v-show="mode === 'visual'" :class="['relative overflow-hidden rounded-b-xl', isFullscreen ? 'flex-1 flex flex-col' : '']">
      <div
        ref="editorRef"
        contenteditable="true"
        @input="handleInput"
        @click="handleEditorClick"
        @scroll="handleScroll"
        @keyup="checkSelectionState"
        @mouseup="checkSelectionState"
        @select="checkSelectionState"
        :class="[
          'p-4 bg-slate-950 text-slate-100 leading-relaxed overflow-y-auto focus:outline-none custom-scrollbar prose prose-invert max-w-none',
          isFullscreen ? 'flex-1 h-full max-h-none min-h-[400px]' : 'min-h-[220px] max-h-[420px]'
        ]"
      />

      <!-- Interactive Mouse Drag Resize Overlay for Selected Image -->
      <div
        v-if="imgOverlayPos && selectedImgElement"
        :style="{
          top: `${imgOverlayPos.top}px`,
          left: `${imgOverlayPos.left}px`,
          width: `${imgOverlayPos.width}px`,
          height: `${imgOverlayPos.height}px`
        }"
        class="absolute pointer-events-none border-2 border-indigo-500/90 rounded-2xl z-20 shadow-2xl ring-4 ring-indigo-500/20"
      >
        <!-- 4 Corner Handles -->
        <div
          @mousedown="(e) => handleMouseDownResize(e, 'nw')"
          class="absolute -top-2.5 -left-2.5 w-5 h-5 bg-indigo-500 border-2 border-white rounded-full cursor-nwse-resize pointer-events-auto hover:scale-125 shadow-xl transition-all ring-2 ring-indigo-600/40"
          title="تغییر اندازه گوشه بالا-چپ"
        />
        <div
          @mousedown="(e) => handleMouseDownResize(e, 'ne')"
          class="absolute -top-2.5 -right-2.5 w-5 h-5 bg-indigo-500 border-2 border-white rounded-full cursor-nesw-resize pointer-events-auto hover:scale-125 shadow-xl transition-all ring-2 ring-indigo-600/40"
          title="تغییر اندازه گوشه بالا-راست"
        />
        <div
          @mousedown="(e) => handleMouseDownResize(e, 'sw')"
          class="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-indigo-500 border-2 border-white rounded-full cursor-nesw-resize pointer-events-auto hover:scale-125 shadow-xl transition-all ring-2 ring-indigo-600/40"
          title="تغییر اندازه گوشه پایین-چپ"
        />
        <div
          @mousedown="(e) => handleMouseDownResize(e, 'se')"
          class="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-indigo-500 border-2 border-white rounded-full cursor-nwse-resize pointer-events-auto hover:scale-125 shadow-xl transition-all ring-2 ring-indigo-600/40"
          title="تغییر اندازه گوشه پایین-راست"
        />

        <!-- 4 Mid-Edge Side Handles (Points on 4 Sides) -->
        <div
          @mousedown="(e) => handleMouseDownResize(e, 'w')"
          class="absolute top-1/2 -left-2.5 -translate-y-1/2 w-5 h-5 bg-indigo-500 border-2 border-white rounded-full cursor-ew-resize pointer-events-auto hover:scale-125 shadow-xl transition-all ring-2 ring-indigo-600/40"
          title="تغییر اندازه لبه چپ"
        />
        <div
          @mousedown="(e) => handleMouseDownResize(e, 'e')"
          class="absolute top-1/2 -right-2.5 -translate-y-1/2 w-5 h-5 bg-indigo-500 border-2 border-white rounded-full cursor-ew-resize pointer-events-auto hover:scale-125 shadow-xl transition-all ring-2 ring-indigo-600/40"
          title="تغییر اندازه لبه راست"
        />
        <div
          @mousedown="(e) => handleMouseDownResize(e, 'n')"
          class="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-indigo-500 border-2 border-white rounded-full cursor-ns-resize pointer-events-auto hover:scale-125 shadow-xl transition-all ring-2 ring-indigo-600/40"
          title="تغییر اندازه لبه بالا"
        />
        <div
          @mousedown="(e) => handleMouseDownResize(e, 's')"
          class="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-indigo-500 border-2 border-white rounded-full cursor-ns-resize pointer-events-auto hover:scale-125 shadow-xl transition-all ring-2 ring-indigo-600/40"
          title="تغییر اندازه لبه پایین"
        />

        <!-- Floating Width Label Badge -->
        <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-indigo-500 text-indigo-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow-2xl pointer-events-none whitespace-nowrap backdrop-blur-md">
          {{ Math.round(imgOverlayPos.width) }}px × {{ Math.round(imgOverlayPos.height) }}px
        </div>
      </div>

      <!-- Interactive Selected Table Action & Delete Overlay -->
      <div
        v-if="tableOverlayPos && selectedTableElement"
        :style="{
          top: `${Math.max(0, tableOverlayPos.top - 44)}px`,
          left: `${tableOverlayPos.left}px`,
          width: `${tableOverlayPos.width}px`
        }"
        class="absolute z-30 flex items-center justify-between gap-2 pointer-events-auto select-none"
      >
        <div class="flex items-center gap-1.5 bg-slate-900/95 border border-rose-500/80 p-1.5 rounded-2xl shadow-2xl backdrop-blur-md">
          <!-- Delete Table Button -->
          <button
            type="button"
            @click="deleteSelectedTable"
            class="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-rose-600/30 cursor-pointer"
            :title="schemaStore.activeLocale === 'fa' ? 'حذف کامل جدول از متن' : 'Delete Table'"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>{{ schemaStore.activeLocale === 'fa' ? 'حذف کامل جدول' : 'Delete Table' }}</span>
          </button>

          <div class="h-4 w-px bg-slate-800 mx-0.5" />

          <!-- Add Row Button -->
          <button
            type="button"
            @click="addTableRow"
            class="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-indigo-300 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            :title="schemaStore.activeLocale === 'fa' ? 'افزودن سطر به جدول' : 'Add Row'"
          >
            <Plus class="w-3.5 h-3.5 text-indigo-400" />
            <span>{{ schemaStore.activeLocale === 'fa' ? '+ سطر' : '+ Row' }}</span>
          </button>

          <!-- Add Column Button -->
          <button
            type="button"
            @click="addTableColumn"
            class="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-indigo-300 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            :title="schemaStore.activeLocale === 'fa' ? 'افزودن ستون به جدول' : 'Add Column'"
          >
            <Plus class="w-3.5 h-3.5 text-indigo-400" />
            <span>{{ schemaStore.activeLocale === 'fa' ? '+ ستون' : '+ Col' }}</span>
          </button>

          <button
            type="button"
            @click="clearTableSelection"
            class="p-1 text-slate-400 hover:text-white cursor-pointer ml-1 rtl:ml-0 rtl:mr-1"
            title="بستن منو"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="text-[10px] font-mono text-rose-300 bg-rose-950/90 border border-rose-800/80 px-2.5 py-1 rounded-xl shadow-md font-bold shrink-0 hidden sm:block">
          {{ schemaStore.activeLocale === 'fa' ? 'جدول فعال' : 'Table Active' }}
        </div>
      </div>

      <!-- Interactive Selected Code Block Action & Delete Overlay -->
      <div
        v-if="codeBlockOverlayPos && selectedCodeBlockElement"
        :style="{
          top: `${Math.max(0, codeBlockOverlayPos.top - 44)}px`,
          left: `${codeBlockOverlayPos.left}px`,
          width: `${codeBlockOverlayPos.width}px`
        }"
        class="absolute z-30 flex items-center justify-between gap-2 pointer-events-auto select-none"
      >
        <div class="flex items-center gap-1.5 bg-slate-900/95 border border-amber-500/80 p-1.5 rounded-2xl shadow-2xl backdrop-blur-md">
          <!-- Icon-Only Delete Code Block Button -->
          <button
            type="button"
            @click="deleteSelectedCodeBlock"
            class="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center"
            :title="schemaStore.activeLocale === 'fa' ? 'حذف کامل بلوک کد' : 'Delete Code Block'"
          >
            <Trash2 class="w-4 h-4" />
          </button>

          <button
            type="button"
            @click="clearCodeBlockSelection"
            class="p-1 text-slate-400 hover:text-white cursor-pointer ml-1 rtl:ml-0 rtl:mr-1"
            title="بستن منو"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="text-[10px] font-mono text-amber-300 bg-amber-950/90 border border-amber-800/80 px-2.5 py-1 rounded-xl shadow-md font-bold shrink-0 hidden sm:block">
          {{ schemaStore.activeLocale === 'fa' ? 'بلوک کد فعال' : 'Code Block Active' }}
        </div>
      </div>
    </div>

    <!-- Code Editor Mode -->
    <textarea
      v-show="mode === 'code'"
      v-model="codeHtml"
      @input="handleCodeInput"
      :class="[
        'w-full bg-slate-950 p-4 text-xs font-mono text-amber-300 leading-relaxed focus:outline-none border-0 overflow-y-auto custom-scrollbar',
        isFullscreen ? 'flex-1 h-full min-h-[400px]' : 'min-h-[220px] max-h-[420px]'
      ]"
    />

    <!-- Preview Mode -->
    <div
      v-show="mode === 'preview'"
      :class="[
        'p-5 bg-slate-900/90 overflow-y-auto custom-scrollbar rounded-b-2xl',
        isFullscreen ? 'flex-1 h-full max-h-none min-h-[400px]' : 'min-h-[220px] max-h-[420px]'
      ]"
    >
      <div
        v-if="modelValue"
        v-html="cleanPreviewHtml"
        class="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed font-sans"
      />
      <div v-else class="text-center py-12 text-slate-500 text-xs italic">
        {{ schemaStore.activeLocale === 'fa' ? 'محتوایی برای پیش‌نمایش وجود ندارد' : 'No content to preview yet' }}
      </div>
    </div>

    <!-- Hyperlink Modal Dialog -->
    <Teleport to="body">
      <div v-if="isLinkModalOpen" dir="ltr" class="fixed inset-0 z-[999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div :dir="schemaStore.direction" class="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 class="font-bold text-sm text-white flex items-center gap-2">
              <Globe class="w-4 h-4 text-sky-400" />
              <span>{{ schemaStore.activeLocale === 'fa' ? 'افزودن پیوند (لینک)' : 'Insert Link' }}</span>
            </h4>
            <button type="button" @click="isLinkModalOpen = false" class="text-slate-400 hover:text-white cursor-pointer">
              <X class="w-4 h-4" />
            </button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">
                {{ schemaStore.activeLocale === 'fa' ? 'عنوان لینک (Text):' : 'Link Text:' }}
              </label>
              <input
                type="text"
                v-model="linkText"
                placeholder="مشاهده وب‌سایت"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">
                {{ schemaStore.activeLocale === 'fa' ? 'آدرس مقصد (URL):' : 'Target URL:' }}
              </label>
              <input
                type="url"
                v-model="linkUrl"
                placeholder="https://example.com"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" @click="isLinkModalOpen = false" class="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
              {{ schemaStore.activeLocale === 'fa' ? 'انصراف' : 'Cancel' }}
            </button>
            <button type="button" @click="confirmInsertLink" class="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-sky-600/20 flex items-center gap-1 cursor-pointer">
              <Check class="w-3.5 h-3.5" />
              <span>{{ schemaStore.activeLocale === 'fa' ? 'افزودن لینک' : 'Insert Link' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Image Insert Modal Dialog -->
    <Teleport to="body">
      <div v-if="isImageModalOpen" dir="ltr" class="fixed inset-0 z-[999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div :dir="schemaStore.direction" class="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 class="font-bold text-sm text-white flex items-center gap-2">
              <ImageIcon class="w-4 h-4 text-emerald-400" />
              <span>{{ schemaStore.activeLocale === 'fa' ? 'افزودن تصویر به متن' : 'Insert Image' }}</span>
            </h4>
            <button type="button" @click="isImageModalOpen = false" class="text-slate-400 hover:text-white cursor-pointer">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Hidden Device File Input -->
          <input ref="fileInputRef" type="file" accept="image/*" @change="handleDeviceImageSelect" class="hidden" />

          <div class="space-y-4">
            <!-- Local File Upload Box -->
            <div class="p-4 bg-slate-950 border border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl text-center space-y-2 transition-colors">
              <Upload class="w-6 h-6 text-emerald-400 mx-auto" />
              <div class="text-xs text-slate-300 font-medium">
                {{ schemaStore.activeLocale === 'fa' ? 'انتخاب تصویر از حافظه دستگاه / سیستم' : 'Select image from your device' }}
              </div>
              <button
                type="button"
                @click="fileInputRef?.click()"
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Upload class="w-3.5 h-3.5" />
                <span>{{ schemaStore.activeLocale === 'fa' ? 'انتخاب فایل تصویر' : 'Choose Local File' }}</span>
              </button>
            </div>

            <div class="flex items-center gap-2 text-slate-500 text-[11px] my-1">
              <div class="h-px bg-slate-800 flex-1" />
              <span>{{ schemaStore.activeLocale === 'fa' ? 'یا لینک آنلاین تصویر' : 'or Online Image URL' }}</span>
              <div class="h-px bg-slate-800 flex-1" />
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">
                {{ schemaStore.activeLocale === 'fa' ? 'آدرس آنلاین تصویر (URL):' : 'Image URL:' }}
              </label>
              <input
                type="url"
                v-model="imageUrl"
                placeholder="https://..."
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">
                {{ schemaStore.activeLocale === 'fa' ? 'انتخاب سریع از گالری نمونه:' : 'Quick Select Sample:' }}
              </label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="(img, idx) in sampleImages"
                  :key="idx"
                  type="button"
                  @click="imageUrl = img"
                  :class="[
                    'relative rounded-xl overflow-hidden border transition-all h-16 cursor-pointer',
                    imageUrl === img ? 'border-emerald-500 ring-2 ring-emerald-500/50' : 'border-slate-800 hover:border-slate-600'
                  ]"
                >
                  <img :src="img" alt="Sample preview" class="w-full h-full object-cover" />
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
              <div>
                <label class="block text-[11px] font-medium text-slate-300 mb-1">
                  {{ schemaStore.activeLocale === 'fa' ? 'اندازه اولیه تصویر:' : 'Initial Size:' }}
                </label>
                <select
                  v-model="imageModalWidth"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="100%">100% (بزرگ)</option>
                  <option value="75%">75% (متوسط بزرگ)</option>
                  <option value="50%">50% (متوسط)</option>
                  <option value="25%">25% (کوچک)</option>
                </select>
              </div>

              <div>
                <label class="block text-[11px] font-medium text-slate-300 mb-1">
                  {{ schemaStore.activeLocale === 'fa' ? 'تراز تصویر:' : 'Alignment:' }}
                </label>
                <select
                  v-model="imageModalAlign"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="center">وسط‌چین (Center)</option>
                  <option value="right">راست‌چین (Right)</option>
                  <option value="left">چپ‌چین (Left)</option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" @click="isImageModalOpen = false" class="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
              {{ schemaStore.activeLocale === 'fa' ? 'انصراف' : 'Cancel' }}
            </button>
            <button type="button" @click="confirmInsertImage()" class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 flex items-center gap-1 cursor-pointer">
              <Check class="w-3.5 h-3.5" />
              <span>{{ schemaStore.activeLocale === 'fa' ? 'درج تصویر' : 'Insert Image' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import DOMPurify from 'dompurify';
import { useSchemaStore } from '../stores/schema';
import { resolveLabel } from '../utils/resolveLabel';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Highlighter,
  Type,
  Eye,
  FileCode,
  X,
  Check,
  Globe,
  Upload,
  Sparkles,
  Undo,
  Redo,
  RemoveFormatting,
  Trash2,
  Scaling,
  Pipette,
  RotateCcw,
  Maximize2,
  Minimize2,
  Plus
} from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    disabled?: boolean;
  }>(),
  {
    modelValue: '',
    disabled: false
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void;
}>();

const schemaStore = useSchemaStore();
const editorRef = ref<HTMLDivElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

const mode = ref<'visual' | 'code' | 'preview'>('visual');
const isFullscreen = ref(false);
const codeHtml = ref(props.modelValue || '');

// Formats & Formatting status
const activeFormats = ref({
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  unorderedList: false,
  orderedList: false,
  alignLeft: false,
  alignCenter: false,
  alignRight: false,
  alignJustify: false
});

const currentFont = ref('');
const currentFontSize = ref('');
const currentHeading = ref('p');

const isColorPickerOpen = ref(false);
const isHighlightPickerOpen = ref(false);

// Modals state
const isLinkModalOpen = ref(false);
const linkUrl = ref('');
const linkText = ref('');

const isImageModalOpen = ref(false);
const imageUrl = ref('');
const imageAlt = ref('');
const imageModalWidth = ref('100%');
const imageModalAlign = ref<'center' | 'left' | 'right'>('center');

// Image selection & resize overlay
const selectedImgElement = ref<HTMLImageElement | null>(null);
const imgOverlayPos = ref<{ top: number; left: number; width: number; height: number } | null>(null);
const savedRange = ref<Range | null>(null);

// Table selection & delete overlay
const selectedTableElement = ref<HTMLTableElement | null>(null);
const tableOverlayPos = ref<{ top: number; left: number; width: number; height: number } | null>(null);

// Code Block selection & delete overlay
const selectedCodeBlockElement = ref<HTMLPreElement | null>(null);
const codeBlockOverlayPos = ref<{ top: number; left: number; width: number; height: number } | null>(null);

onMounted(() => {
  if (editorRef.value) {
    editorRef.value.innerHTML = props.modelValue || '';
    editorRef.value.addEventListener('scroll', handleScroll);
  }
  window.addEventListener('keydown', handleGlobalKeydown);
  window.addEventListener('resize', handleScroll);
  window.addEventListener('scroll', handleScroll, true);
  document.addEventListener('selectionchange', checkSelectionState);
  document.addEventListener('click', handleGlobalDocumentClick);
});

onUnmounted(() => {
  if (editorRef.value) {
    editorRef.value.removeEventListener('scroll', handleScroll);
  }
  window.removeEventListener('keydown', handleGlobalKeydown);
  window.removeEventListener('resize', handleScroll);
  window.removeEventListener('scroll', handleScroll, true);
  document.removeEventListener('selectionchange', checkSelectionState);
  document.removeEventListener('click', handleGlobalDocumentClick);
});

function handleGlobalDocumentClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (isColorPickerOpen.value || isHighlightPickerOpen.value) {
    if (!target.closest('.color-picker-container')) {
      isColorPickerOpen.value = false;
      isHighlightPickerOpen.value = false;
    }
  }
}

function handleGlobalKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isFullscreen.value) {
    isFullscreen.value = false;
  }
}

watch(
  () => props.modelValue,
  newVal => {
    const val = newVal || '';
    codeHtml.value = val;
    if (editorRef.value && mode.value === 'visual') {
      const currentHtml = editorRef.value.innerHTML;
      if (currentHtml !== val) {
        editorRef.value.innerHTML = val;
      }
    }
  }
);

const cleanPreviewHtml = computed(() => {
  return DOMPurify.sanitize(props.modelValue || '');
});

const defaultFontFamilies = [
  { label: 'Vazirmatn', value: 'Vazirmatn, sans-serif' },
  { label: 'IRANSans / Yekan', value: 'IRANSans, Yekan, sans-serif' },
  { label: 'Sans-Serif', value: 'system-ui, sans-serif' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Monospace', value: 'monospace' }
];

const fontFamilies = computed(() => {
  const customList = (schemaStore.schema?.system?.custom_fonts || []).map(f => ({
    label: resolveLabel(f.label, schemaStore.activeLocale) || f.name,
    value: `'${f.name}', sans-serif`
  }));
  return [...defaultFontFamilies, ...customList];
});

const defaultFontSizes = [
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '22px', value: '22px' },
  { label: '28px', value: '28px' }
];

const fontSizes = computed(() => {
  const customList = (schemaStore.schema?.system?.custom_font_sizes || []).map(s => {
    const sizeVal = /^\d+$/.test(s.size.trim()) ? `${s.size.trim()}px` : s.size.trim();
    const resolvedLabel = resolveLabel(s.label, schemaStore.activeLocale);
    return {
      label: resolvedLabel ? `${resolvedLabel} (${sizeVal})` : sizeVal,
      value: sizeVal
    };
  });
  return [...defaultFontSizes, ...customList];
});

function checkSelectionState() {
  if (!editorRef.value || mode.value !== 'visual') return;
  try {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorRef.value.contains(sel.anchorNode)) return;

    // Save selection range continuously whenever selection changes inside editorRef
    savedRange.value = sel.getRangeAt(0).cloneRange();

    activeFormats.value = {
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikethrough: document.queryCommandState('strikeThrough'),
      unorderedList: document.queryCommandState('insertUnorderedList'),
      orderedList: document.queryCommandState('insertOrderedList'),
      alignLeft: document.queryCommandState('justifyLeft'),
      alignCenter: document.queryCommandState('justifyCenter'),
      alignRight: document.queryCommandState('justifyRight'),
      alignJustify: document.queryCommandState('justifyFull')
    };

    const node = sel.anchorNode.nodeType === 1 ? (sel.anchorNode as HTMLElement) : sel.anchorNode.parentElement;
    if (node) {
      const block = node.closest('h1, h2, h3, h4, h5, h6, blockquote, p');
      if (block) {
        currentHeading.value = block.tagName.toLowerCase();
      } else {
        currentHeading.value = 'p';
      }

      const compStyle = window.getComputedStyle(node);
      if (compStyle.fontFamily) {
        const familyName = compStyle.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
        const matched = fontFamilies.value.find(f => f.value.toLowerCase().includes(familyName.toLowerCase()));
        if (matched) {
          currentFont.value = matched.value;
        }
      }

      if (compStyle.fontSize) {
        currentFontSize.value = compStyle.fontSize;
      }
    }
  } catch {
    // Ignore DOM state query errors
  }
}

function handleInput() {
  if (editorRef.value) {
    const rawHtml = editorRef.value.innerHTML;
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    codeHtml.value = cleanHtml;
    emit('update:modelValue', cleanHtml);
    checkSelectionState();
  }
}

function handleCodeInput() {
  const cleanHtml = DOMPurify.sanitize(codeHtml.value);
  emit('update:modelValue', cleanHtml);
  if (editorRef.value) {
    editorRef.value.innerHTML = cleanHtml;
  }
}

function execCmd(command: string, arg: string | undefined = undefined) {
  if (props.disabled || mode.value !== 'visual') return;
  if (editorRef.value) {
    editorRef.value.focus();
  }
  document.execCommand(command, false, arg);
  handleInput();
}

function applyHeading(tag: 'h1' | 'h2' | 'h3' | 'h4' | 'p') {
  if (props.disabled || mode.value !== 'visual') return;
  if (editorRef.value) {
    editorRef.value.focus();
  }
  const targetTag = currentHeading.value === tag && tag !== 'p' ? 'p' : tag;
  document.execCommand('formatBlock', false, `<${targetTag}>`);
  currentHeading.value = targetTag;
  handleInput();
}

function toggleBulletList() {
  if (props.disabled || mode.value !== 'visual') return;
  if (editorRef.value) editorRef.value.focus();
  document.execCommand('insertUnorderedList');

  if (editorRef.value) {
    const uls = editorRef.value.querySelectorAll('ul');
    uls.forEach(ul => {
      if (!ul.classList.contains('list-disc')) {
        ul.className = 'list-disc pr-6 pl-2 my-2 space-y-1 text-slate-200';
      }
    });
  }
  handleInput();
  checkSelectionState();
}

function toggleOrderedList() {
  if (props.disabled || mode.value !== 'visual') return;
  if (editorRef.value) editorRef.value.focus();
  document.execCommand('insertOrderedList');

  if (editorRef.value) {
    const ols = editorRef.value.querySelectorAll('ol');
    ols.forEach(ol => {
      if (!ol.classList.contains('list-decimal')) {
        ol.className = 'list-decimal pr-6 pl-2 my-2 space-y-1 text-slate-200';
      }
    });
  }
  handleInput();
  checkSelectionState();
}

function applyInlineStyle(property: 'fontFamily' | 'fontSize' | 'color' | 'backgroundColor', value: string) {
  if (props.disabled || mode.value !== 'visual') return;
  if (!value) return;

  restoreSelection();
  if (editorRef.value) editorRef.value.focus();

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !editorRef.value?.contains(sel.anchorNode)) return;

  const range = sel.getRangeAt(0);
  const cssPropName = property === 'backgroundColor' ? 'background-color' : property === 'fontFamily' ? 'font-family' : property === 'fontSize' ? 'font-size' : 'color';

  let cssValue = value;
  if (property === 'fontSize' && !value.endsWith('px')) cssValue = `${value}px`;

  if (range.collapsed) {
    const node = sel.anchorNode?.nodeType === 1 ? (sel.anchorNode as HTMLElement) : sel.anchorNode?.parentElement;
    const styleTarget = node?.closest('span, p, div, h1, h2, h3, h4, li, td') as HTMLElement;
    if (styleTarget && editorRef.value.contains(styleTarget)) {
      styleTarget.style.setProperty(cssPropName, cssValue, 'important');
      if (property === 'fontSize') styleTarget.style.setProperty('line-height', '1.4', 'important');
    }
  } else {
    const anchorElem = sel.anchorNode?.nodeType === 1 ? (sel.anchorNode as HTMLElement) : sel.anchorNode?.parentElement;
    const focusElem = sel.focusNode?.nodeType === 1 ? (sel.focusNode as HTMLElement) : sel.focusNode?.parentElement;

    const parentSpan = anchorElem?.closest('span') as HTMLElement | null;

    if (parentSpan && focusElem && parentSpan.contains(focusElem) && editorRef.value.contains(parentSpan)) {
      parentSpan.style.setProperty(cssPropName, cssValue, 'important');
      if (property === 'fontSize') parentSpan.style.setProperty('line-height', '1.4', 'important');
    } else {
      const contents = range.extractContents();

      const innerSpans = contents.querySelectorAll('span');
      innerSpans.forEach(s => {
        s.style.removeProperty(cssPropName);
        if (s.style.length === 0) {
          while (s.firstChild) s.parentNode?.insertBefore(s.firstChild, s);
          s.remove();
        }
      });

      const span = document.createElement('span');
      span.style.setProperty(cssPropName, cssValue, 'important');
      if (property === 'fontSize') span.style.setProperty('line-height', '1.4', 'important');
      span.appendChild(contents);
      range.insertNode(span);

      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.addRange(newRange);
    }
  }

  handleInput();
  checkSelectionState();
}

function applyFontFamily(font: string) {
  applyInlineStyle('fontFamily', font);
}

function applyFontSize(sizeVal: string) {
  applyInlineStyle('fontSize', sizeVal);
}

function applyTextColor(hex: string, keepOpen = false) {
  if (hex === 'inherit' || hex === 'default') {
    applyInlineStyle('color', '#f8fafc');
  } else {
    applyInlineStyle('color', hex);
  }
  if (!keepOpen) {
    isColorPickerOpen.value = false;
  }
}

function applyHighlightColor(hex: string, keepOpen = false) {
  if (hex === 'transparent' || hex === 'default') {
    applyInlineStyle('backgroundColor', 'transparent');
  } else {
    applyInlineStyle('backgroundColor', hex);
  }
  if (!keepOpen) {
    isHighlightPickerOpen.value = false;
  }
}

function toggleTextDirection(dir: 'rtl' | 'ltr') {
  if (props.disabled || mode.value !== 'visual') return;
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && editorRef.value?.contains(sel.anchorNode)) {
    const node = sel.anchorNode.nodeType === 1 ? (sel.anchorNode as HTMLElement) : sel.anchorNode.parentElement;
    const block = node?.closest('p, div, h1, h2, h3, h4, blockquote, li') as HTMLElement;
    if (block) {
      block.setAttribute('dir', dir);
      block.style.textAlign = dir === 'rtl' ? 'right' : 'left';
    } else {
      document.execCommand('formatBlock', false, `<p dir="${dir}" style="text-align: ${dir === 'rtl' ? 'right' : 'left'};">`);
    }
  }
  handleInput();
}

function insertCodeBlock() {
  if (props.disabled || mode.value !== 'visual') return;
  const codeHtml = `<pre class="bg-slate-900 text-amber-300 p-3 rounded-xl font-mono text-xs border border-slate-800 my-2 overflow-x-auto" dir="ltr"><code>// Insert code here...</code></pre>`;
  document.execCommand('insertHTML', false, codeHtml);
  handleInput();
}

function insertTable() {
  if (props.disabled || mode.value !== 'visual') return;
  const tableHtml = `
    <table class="w-full border-collapse border border-slate-700 text-xs my-3 bg-slate-900/60 rounded-xl overflow-hidden">
      <thead>
        <tr class="bg-slate-800 text-indigo-300 border-b border-slate-700">
          <th class="p-2 border-r border-slate-700 text-right">ستون ۱</th>
          <th class="p-2 border-r border-slate-700 text-right">ستون ۲</th>
          <th class="p-2 text-right">ستون ۳</th>
        </tr>
      </thead>
      <tbody>
        <tr class="border-b border-slate-800 hover:bg-slate-800/40">
          <td class="p-2 border-r border-slate-800">داده ۱</td>
          <td class="p-2 border-r border-slate-800">داده ۲</td>
          <td class="p-2">داده ۳</td>
        </tr>
      </tbody>
    </table>
  `;
  document.execCommand('insertHTML', false, tableHtml);
  handleInput();
}

function saveSelection() {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    savedRange.value = sel.getRangeAt(0).cloneRange();
  }
}

function restoreSelection() {
  if (!savedRange.value) return;
  const sel = window.getSelection();
  if (sel) {
    sel.removeAllRanges();
    sel.addRange(savedRange.value);
  }
}

function openLinkModal() {
  saveSelection();
  const selText = window.getSelection()?.toString() || '';
  linkText.value = selText;
  linkUrl.value = '';
  isLinkModalOpen.value = true;
}

function confirmInsertLink() {
  if (!linkUrl.value) return;
  restoreSelection();
  if (linkText.value) {
    const aHtml = `<a href="${linkUrl.value}" target="_blank" rel="noopener noreferrer" class="text-sky-400 underline font-medium hover:text-sky-300">${linkText.value}</a>`;
    document.execCommand('insertHTML', false, aHtml);
  } else {
    execCmd('createLink', linkUrl.value);
  }
  handleInput();
  isLinkModalOpen.value = false;
}

function openImageModal() {
  saveSelection();
  imageUrl.value = '';
  imageAlt.value = '';
  imageModalWidth.value = '100%';
  imageModalAlign.value = 'center';
  isImageModalOpen.value = true;
}

function confirmInsertImage(srcToUse?: string) {
  const src = srcToUse || imageUrl.value;
  if (!src) return;
  restoreSelection();
  const alt = imageAlt.value || 'Uploaded Image';
  let marginStyle = '12px auto';
  if (imageModalAlign.value === 'left') marginStyle = '12px auto 12px 0';
  if (imageModalAlign.value === 'right') marginStyle = '12px 0 12px auto';

  const widthStyle = imageModalWidth.value || '100%';
  const imgHtml = `<img src="${src}" alt="${alt}" style="width: ${widthStyle}; max-width: 100%; height: auto; border-radius: 12px; margin: ${marginStyle}; display: block; border: 1px solid #334155;" />`;
  document.execCommand('insertHTML', false, imgHtml);
  handleInput();
  isImageModalOpen.value = false;
}

function handleDeviceImageSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    const dataUrl = evt.target?.result as string;
    if (dataUrl) {
      confirmInsertImage(dataUrl);
    }
  };
  reader.readAsDataURL(file);
}

function handleEditorClick(e: MouseEvent) {
  const target = e.target as HTMLElement;

  isColorPickerOpen.value = false;
  isHighlightPickerOpen.value = false;

  // Code Block selection detection
  const pre = target?.closest('pre') as HTMLPreElement | null;
  if (pre && editorRef.value?.contains(pre)) {
    if (selectedCodeBlockElement.value && selectedCodeBlockElement.value !== pre) {
      selectedCodeBlockElement.value.style.outline = '';
    }
    pre.style.outline = '2px dashed #f59e0b';
    pre.style.outlineOffset = '4px';
    selectedCodeBlockElement.value = pre;
    updateCodeBlockOverlayPos();
  } else {
    clearCodeBlockSelection();
  }

  // Table selection detection
  const table = target?.closest('table') as HTMLTableElement | null;
  if (table && editorRef.value?.contains(table)) {
    if (selectedTableElement.value && selectedTableElement.value !== table) {
      selectedTableElement.value.style.outline = '';
    }
    table.style.outline = '2px dashed #f43f5e';
    table.style.outlineOffset = '4px';
    selectedTableElement.value = table;
    updateTableOverlayPos();
  } else {
    clearTableSelection();
  }

  // Image selection detection
  if (target && target.tagName === 'IMG') {
    if (selectedImgElement.value && selectedImgElement.value !== target) {
      selectedImgElement.value.style.outline = '';
    }
    const img = target as HTMLImageElement;
    img.style.outline = '3px solid #6366f1';
    img.style.outlineOffset = '3px';
    selectedImgElement.value = img;
    updateImgOverlayPos();
  } else {
    clearImageSelection();
  }
}

function handleScroll() {
  if (selectedImgElement.value) updateImgOverlayPos();
  if (selectedTableElement.value) updateTableOverlayPos();
  if (selectedCodeBlockElement.value) updateCodeBlockOverlayPos();
}

function clearCodeBlockSelection() {
  if (selectedCodeBlockElement.value) {
    selectedCodeBlockElement.value.style.outline = '';
    selectedCodeBlockElement.value = null;
  }
  codeBlockOverlayPos.value = null;
}

function updateCodeBlockOverlayPos() {
  if (!selectedCodeBlockElement.value || !editorRef.value || !document.body.contains(selectedCodeBlockElement.value)) {
    if (selectedCodeBlockElement.value) selectedCodeBlockElement.value.style.outline = '';
    selectedCodeBlockElement.value = null;
    codeBlockOverlayPos.value = null;
    return;
  }
  const rect = selectedCodeBlockElement.value.getBoundingClientRect();
  const editorRect = editorRef.value.getBoundingClientRect();

  if (rect.bottom <= editorRect.top + 5 || rect.top >= editorRect.bottom - 5) {
    codeBlockOverlayPos.value = null;
    return;
  }

  codeBlockOverlayPos.value = {
    top: rect.top - editorRect.top,
    left: rect.left - editorRect.left,
    width: rect.width,
    height: rect.height
  };
}

function deleteSelectedCodeBlock() {
  if (!selectedCodeBlockElement.value) return;
  selectedCodeBlockElement.value.remove();
  clearCodeBlockSelection();
  handleInput();
}

function clearTableSelection() {
  if (selectedTableElement.value) {
    selectedTableElement.value.style.outline = '';
    selectedTableElement.value = null;
  }
  tableOverlayPos.value = null;
}

function updateTableOverlayPos() {
  if (!selectedTableElement.value || !editorRef.value || !document.body.contains(selectedTableElement.value)) {
    if (selectedTableElement.value) selectedTableElement.value.style.outline = '';
    selectedTableElement.value = null;
    tableOverlayPos.value = null;
    return;
  }
  const rect = selectedTableElement.value.getBoundingClientRect();
  const editorRect = editorRef.value.getBoundingClientRect();

  // Hide overlay if table is scrolled out of visible editor container viewport
  if (rect.bottom <= editorRect.top + 5 || rect.top >= editorRect.bottom - 5) {
    tableOverlayPos.value = null;
    return;
  }

  tableOverlayPos.value = {
    top: rect.top - editorRect.top,
    left: rect.left - editorRect.left,
    width: rect.width,
    height: rect.height
  };
}

function deleteSelectedTable() {
  if (!selectedTableElement.value) return;
  selectedTableElement.value.remove();
  clearTableSelection();
  handleInput();
}

function addTableRow() {
  if (!selectedTableElement.value) return;
  const tbody = selectedTableElement.value.querySelector('tbody') || selectedTableElement.value;
  const lastRow = tbody.querySelector('tr');
  const colCount = lastRow ? lastRow.querySelectorAll('th, td').length : 3;
  const tr = document.createElement('tr');
  tr.className = 'border-b border-slate-800 hover:bg-slate-800/40';
  for (let i = 0; i < colCount; i++) {
    const td = document.createElement('td');
    td.className = 'p-2 border-r border-slate-800';
    td.textContent = `داده جدید ${i + 1}`;
    tr.appendChild(td);
  }
  tbody.appendChild(tr);
  handleInput();
  updateTableOverlayPos();
}

function addTableColumn() {
  if (!selectedTableElement.value) return;
  const rows = selectedTableElement.value.querySelectorAll('tr');
  rows.forEach((tr, index) => {
    if (index === 0 && tr.parentElement?.tagName === 'THEAD') {
      const th = document.createElement('th');
      th.className = 'p-2 border-r border-slate-700 text-right';
      th.textContent = `ستون جدید`;
      tr.appendChild(th);
    } else {
      const td = document.createElement('td');
      td.className = 'p-2 border-r border-slate-800';
      td.textContent = `داده`;
      tr.appendChild(td);
    }
  });
  handleInput();
  updateTableOverlayPos();
}

function clearImageSelection() {
  if (selectedImgElement.value) {
    selectedImgElement.value.style.outline = '';
    selectedImgElement.value = null;
  }
  imgOverlayPos.value = null;
}

function updateImgOverlayPos() {
  if (!selectedImgElement.value || !editorRef.value || !document.body.contains(selectedImgElement.value)) {
    if (selectedImgElement.value) selectedImgElement.value.style.outline = '';
    selectedImgElement.value = null;
    imgOverlayPos.value = null;
    return;
  }
  const imgRect = selectedImgElement.value.getBoundingClientRect();
  const editorRect = editorRef.value.getBoundingClientRect();

  // Hide overlay if image is scrolled out of visible editor container viewport
  if (imgRect.bottom <= editorRect.top + 5 || imgRect.top >= editorRect.bottom - 5) {
    imgOverlayPos.value = null;
    return;
  }

  imgOverlayPos.value = {
    top: imgRect.top - editorRect.top,
    left: imgRect.left - editorRect.left,
    width: imgRect.width,
    height: imgRect.height
  };
}

function handleMouseDownResize(e: MouseEvent, handle: 'se' | 'sw' | 'ne' | 'nw' | 'e' | 'w' | 'n' | 's') {
  e.preventDefault();
  e.stopPropagation();
  if (!selectedImgElement.value || !editorRef.value) return;

  const startX = e.clientX;
  const startWidth = selectedImgElement.value.offsetWidth;
  const editorWidth = editorRef.value.clientWidth - 32;

  const onMouseMove = (moveEvent: MouseEvent) => {
    moveEvent.preventDefault();
    const isEast = handle === 'e' || handle.includes('e');
    const isWest = handle === 'w' || handle.includes('w');
    let deltaX = 0;
    if (isEast) {
      deltaX = moveEvent.clientX - startX;
    } else if (isWest) {
      deltaX = startX - moveEvent.clientX;
    } else {
      deltaX = moveEvent.clientX - startX;
    }

    const newWidth = Math.max(50, Math.min(editorWidth, startWidth + deltaX));
    selectedImgElement.value!.style.width = `${Math.round(newWidth)}px`;
    updateImgOverlayPos();
  };

  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    handleInput();
    updateImgOverlayPos();
  };

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}

function setResizeSelectedImage(newWidth: string) {
  if (!selectedImgElement.value) return;
  selectedImgElement.value.style.width = newWidth;
  handleInput();
  updateImgOverlayPos();
}

function setAlignSelectedImage(align: 'left' | 'center' | 'right') {
  if (!selectedImgElement.value) return;
  selectedImgElement.value.style.display = 'block';
  if (align === 'center') {
    selectedImgElement.value.style.margin = '12px auto';
  } else if (align === 'left') {
    selectedImgElement.value.style.margin = '12px auto 12px 0';
  } else if (align === 'right') {
    selectedImgElement.value.style.margin = '12px 0 12px auto';
  }
  handleInput();
  updateImgOverlayPos();
}

function deleteSelectedImage() {
  if (!selectedImgElement.value) return;
  selectedImgElement.value.remove();
  selectedImgElement.value = null;
  imgOverlayPos.value = null;
  handleInput();
}

const textColors = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Sky', hex: '#0ea5e9' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'White', hex: '#f8fafc' }
];

const highlightColors = [
  { name: 'Yellow', hex: '#fef08a' },
  { name: 'Lime', hex: '#d9f99d' },
  { name: 'Cyan', hex: '#a5f3fc' },
  { name: 'Pink', hex: '#fbcfe8' },
  { name: 'Orange', hex: '#fed7aa' },
  { name: 'Purple', hex: '#e9d5ff' }
];

const sampleImages = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&fit=crop',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&fit=crop',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&fit=crop'
];
</script>
