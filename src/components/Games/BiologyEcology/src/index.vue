<template>
  <div class="min-h-screen bg-green-50 font-sans text-slate-800 pb-12 selection:bg-green-200">
    <header
      class="bg-emerald-700 text-white shadow-lg sticky top-0 z-20 border-b-4 border-emerald-500">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between w-96%">
        <div class="flex items-center gap-3">
          <div class="bg-emerald-800 p-2 rounded-full border border-emerald-400/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-emerald-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h1 class="text-xl md:text-2xl font-bold tracking-wide">
            生态链
            <span class="text-emerald-200 font-light">拼图</span>
          </h1>
        </div>
        <div class="flex gap-3">
          <button
            @click="showRules = true"
            class="text-sm font-medium bg-emerald-800/50 hover:bg-emerald-800 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd" />
            </svg>
            <span class="hidden sm:inline">规则</span>
          </button>
          <button
            @click="resetGame"
            class="text-sm font-medium bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg transition-colors shadow-sm flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span class="hidden sm:inline">重置</span>
          </button>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8 space-y-6 max-w-6xl">
      <Transition name="fade">
        <div
          v-if="showRules"
          class="bg-white rounded-xl shadow-md border-l-4 border-emerald-500 p-5 relative overflow-hidden">
          <button
            @click="showRules = false"
            class="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd" />
            </svg>
          </button>
          <h2 class="text-lg font-bold text-emerald-800 mb-3 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            什么是食物链？
          </h2>
          <p class="text-sm text-slate-600 mb-4 leading-relaxed">
            食物链是生态系统中生物之间由于捕食关系形成的链状结构。能量通过食物链单向流动，逐级递减。
          </p>
          <div class="flex flex-wrap gap-3 text-xs font-medium">
            <div
              class="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded border border-green-100">
              <span class="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
              <span class="text-green-800">生产者 (植物)</span>
            </div>
            <div
              class="flex items-center gap-1.5 bg-lime-50 px-2 py-1 rounded border border-lime-100">
              <span class="w-2.5 h-2.5 bg-lime-500 rounded-full"></span>
              <span class="text-lime-800">初级消费者 (草食)</span>
            </div>
            <div
              class="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded border border-amber-100">
              <span class="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
              <span class="text-amber-800">次级消费者 (肉食)</span>
            </div>
          </div>
        </div>
      </Transition>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div
          class="bg-white rounded-xl shadow-sm border border-emerald-100 p-4 lg:col-span-1 h-fit">
          <div class="flex items-center justify-between mb-4 border-b border-emerald-50 pb-2">
            <h3 class="font-bold text-emerald-800 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              生物库
            </h3>
            <span
              class="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {{ draggableOrganisms.length }}
            </span>
          </div>

          <TransitionGroup
            name="list"
            tag="div"
            class="grid grid-cols-2 lg:grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            <div
              v-for="organism in draggableOrganisms"
              :key="organism.id"
              draggable="true"
              @dragstart="handleDragStart($event, organism)"
              @dragend="handleDragEnd"
              class="group bg-slate-50 hover:bg-white border-2 border-transparent hover:border-emerald-400 rounded-lg p-2 cursor-grab active:cursor-grabbing transition-all hover:shadow-md flex flex-col items-center gap-2 select-none"
              :class="{ 'opacity-50 grayscale': isDragging && draggedItem?.id !== organism.id }">
              <div class="w-full aspect-square rounded-md overflow-hidden bg-slate-200 relative">
                <img
                  :src="organism.image"
                  :alt="organism.name"
                  class="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                  loading="lazy" />
                <div
                  class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                  <span class="text-xs text-white font-medium pl-1">{{ organism.name }}</span>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <div class="lg:col-span-3 space-y-6">
          <div class="bg-white rounded-xl shadow-md border border-emerald-100 p-6 relative">
            <div class="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-32 w-32 text-emerald-900"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clip-rule="evenodd" />
              </svg>
            </div>

            <h3
              class="font-bold text-slate-700 text-center mb-8 flex items-center justify-center gap-2">
              <span class="w-8 h-1 bg-emerald-500 rounded-full"></span>
              构建食物链
              <span class="w-8 h-1 bg-emerald-500 rounded-full"></span>
            </h3>

            <div
              class="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2 relative z-10">
              <div class="flex flex-col items-center w-full md:w-1/3 group">
                <div
                  class="relative w-full aspect-[4/3] rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-2"
                  :class="getZoneClass('producer')"
                  @dragover.prevent
                  @dragenter.prevent="handleDragEnter('producer')"
                  @dragleave="handleDragLeave"
                  @drop="handleDrop('producer')">
                  <div v-if="placedOrganisms.producer" class="w-full h-full relative">
                    <img
                      :src="placedOrganisms.producer.image"
                      class="w-full h-full object-cover rounded-lg shadow-sm" />
                    <div
                      class="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-green-700 shadow-sm backdrop-blur-sm whitespace-nowrap">
                      {{ placedOrganisms.producer.name }}
                    </div>
                    <button
                      @click="removeOrganism('producer')"
                      class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-transform hover:scale-110">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor">
                        <path
                          fill-rule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div v-else class="text-center">
                    <div
                      class="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <span class="text-sm font-medium text-green-800">生产者</span>
                    <p class="text-xs text-green-600/70 mt-1">(植物)</p>
                  </div>
                </div>
                <div
                  class="mt-3 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                  第一营养级
                </div>
              </div>

              <div class="hidden md:flex flex-col items-center justify-center text-emerald-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-8 w-8 animate-pulse"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span class="text-[10px] mt-1 font-medium">能量流动</span>
              </div>
              <div class="md:hidden text-emerald-400 my-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>

              <div class="flex flex-col items-center w-full md:w-1/3 group">
                <div
                  class="relative w-full aspect-[4/3] rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-2"
                  :class="getZoneClass('consumer1')"
                  @dragover.prevent
                  @dragenter.prevent="handleDragEnter('consumer1')"
                  @dragleave="handleDragLeave"
                  @drop="handleDrop('consumer1')">
                  <div v-if="placedOrganisms.consumer1" class="w-full h-full relative">
                    <img
                      :src="placedOrganisms.consumer1.image"
                      class="w-full h-full object-cover rounded-lg shadow-sm" />
                    <div
                      class="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-lime-700 shadow-sm backdrop-blur-sm whitespace-nowrap">
                      {{ placedOrganisms.consumer1.name }}
                    </div>
                    <button
                      @click="removeOrganism('consumer1')"
                      class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-transform hover:scale-110">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor">
                        <path
                          fill-rule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div v-else class="text-center">
                    <div
                      class="w-12 h-12 bg-lime-100 text-lime-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <span class="text-sm font-medium text-lime-800">初级消费者</span>
                    <p class="text-xs text-lime-600/70 mt-1">(食草)</p>
                  </div>
                </div>
                <div
                  class="mt-3 text-xs font-bold text-lime-700 bg-lime-50 px-3 py-1 rounded-full border border-lime-100">
                  第二营养级
                </div>
              </div>

              <div class="hidden md:flex flex-col items-center justify-center text-emerald-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-8 w-8 animate-pulse"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span class="text-[10px] mt-1 font-medium">能量流动</span>
              </div>
              <div class="md:hidden text-emerald-400 my-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>

              <div class="flex flex-col items-center w-full md:w-1/3 group">
                <div
                  class="relative w-full aspect-[4/3] rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-2"
                  :class="getZoneClass('consumer2')"
                  @dragover.prevent
                  @dragenter.prevent="handleDragEnter('consumer2')"
                  @dragleave="handleDragLeave"
                  @drop="handleDrop('consumer2')">
                  <div v-if="placedOrganisms.consumer2" class="w-full h-full relative">
                    <img
                      :src="placedOrganisms.consumer2.image"
                      class="w-full h-full object-cover rounded-lg shadow-sm" />
                    <div
                      class="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-amber-700 shadow-sm backdrop-blur-sm whitespace-nowrap">
                      {{ placedOrganisms.consumer2.name }}
                    </div>
                    <button
                      @click="removeOrganism('consumer2')"
                      class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-transform hover:scale-110">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor">
                        <path
                          fill-rule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div v-else class="text-center">
                    <div
                      class="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <span class="text-sm font-medium text-amber-800">次级消费者</span>
                    <p class="text-xs text-amber-600/70 mt-1">(食肉)</p>
                  </div>
                </div>
                <div
                  class="mt-3 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                  第三营养级
                </div>
              </div>
            </div>
          </div>

          <div
            class="bg-white rounded-xl shadow-sm border border-emerald-100 p-5 min-h-[160px] flex flex-col justify-center">
            <Transition name="fade" mode="out-in">
              <div
                v-if="selectedOrganismInfo"
                :key="selectedOrganismInfo.id"
                class="flex gap-4 items-start animate-fade-in">
                <img
                  :src="selectedOrganismInfo.image"
                  class="w-20 h-20 rounded-lg object-cover shadow-sm bg-slate-100 flex-shrink-0" />
                <div>
                  <h4 class="font-bold text-lg text-emerald-800 flex items-center gap-2">
                    {{ selectedOrganismInfo.name }}
                    <span
                      class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-normal border">
                      {{ getRoleLabel(selectedOrganismInfo.role) }}
                    </span>
                  </h4>
                  <p class="text-sm text-slate-600 mt-1 leading-relaxed">
                    {{ selectedOrganismInfo.description }}
                  </p>
                  <p
                    class="text-xs text-emerald-600 mt-2 italic bg-emerald-50 p-2 rounded border border-emerald-100 inline-block">
                    💡 {{ selectedOrganismInfo.fact }}
                  </p>
                </div>
              </div>
              <div v-else class="text-center text-slate-400 py-4">
                <div
                  class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-dashed border-slate-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p class="text-sm">成功放置生物后，此处将显示详细信息</p>
              </div>
            </Transition>
          </div>

          <div class="flex justify-end">
            <button
              @click="showHint"
              class="text-sm text-emerald-600 font-bold hover:text-emerald-700 hover:underline flex items-center gap-1 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path
                  d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
              需要提示？
            </button>
          </div>
        </div>
      </div>

      <Transition name="slide-up">
        <div
          v-if="toast.visible"
          class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
          <div
            class="rounded-xl shadow-2xl p-4 flex items-start gap-3 border-l-4 backdrop-blur-sm"
            :class="
              toast.type === 'error'
                ? 'bg-red-50/95 border-red-500 text-red-800'
                : 'bg-emerald-50/95 border-emerald-500 text-emerald-800'
            ">
            <div class="flex-shrink-0 mt-0.5">
              <svg
                v-if="toast.type === 'error'"
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd" />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-emerald-500"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <div class="flex-1">
              <h4 class="font-bold text-sm">{{ toast.title }}</h4>
              <p class="text-xs mt-1 opacity-90 leading-snug">{{ toast.message }}</p>
            </div>
            <button
              @click="toast.visible = false"
              class="text-current opacity-50 hover:opacity-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </Transition>

      <Transition name="scale">
        <div v-if="gameCompleted" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-emerald-900/60 backdrop-blur-sm" @click="resetGame"></div>
          <div
            class="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative z-10 text-center animate-bounce-in border-4 border-emerald-100">
            <div class="absolute -top-12 left-1/2 -translate-x-1/2">
              <div
                class="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                <span class="text-4xl">🎉</span>
              </div>
            </div>

            <div class="mt-8">
              <h2 class="text-2xl font-bold text-emerald-800 mb-2">食物链构建成功！</h2>
              <p class="text-slate-500 mb-6 text-sm">
                你成功还原了一个完整的生态系统能量流动路径。
              </p>

              <div
                class="bg-slate-50 rounded-lg p-4 mb-6 text-sm font-medium text-slate-700 flex items-center justify-center gap-2">
                <span>{{ placedOrganisms.producer?.name }}</span>
                <span class="text-emerald-300">➜</span>
                <span>{{ placedOrganisms.consumer1?.name }}</span>
                <span class="text-emerald-300">➜</span>
                <span>{{ placedOrganisms.consumer2?.name }}</span>
              </div>

              <button
                @click="resetGame"
                class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all hover:shadow-lg active:scale-95 flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v3.25a1 1 0 11-2 0V13.003a7.002 7.002 0 01-11.603-2.566 1 1 0 01.61-1.276z"
                    clip-rule="evenodd" />
                </svg>
                再来一局
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from "vue";
import caoImg from "./image/cao.jpg";
import shuImg from "./image/shu.jpg";
import huaImg from "./image/hua.jpg";
import tuziImg from "./image/tuzi.jpg";
import luImg from "./image/lu.jpg";
import yangImg from "./image/yang.jpg";
import langImg from "./image/lang.jpg";
import huliImg from "./image/huli.jpg";
import yingImg from "./image/ying.jpg";

// --- Interfaces ---
type Role = "producer" | "consumer1" | "consumer2";

interface Organism {
  id: string;
  name: string;
  image: string;
  role: Role;
  description: string;
  fact: string;
}

// --- Data ---
const organismDatabase: Organism[] = [
  // 生产者
  {
    id: "grass",
    name: "草",
    image: caoImg,
    role: "producer",
    description: "草是绿色植物，能通过光合作用制造有机物，为生态系统提供能量基础。",
    fact: "草是地球上分布最广的植物之一。",
  },
  {
    id: "tree",
    name: "树",
    image: shuImg,
    role: "producer",
    description: "树是大型植物，通过光合作用制造营养物质。",
    fact: "一棵树可以为数百种生物提供食物。",
  },
  {
    id: "flower",
    name: "花",
    image: huaImg,
    role: "producer",
    description: "花是植物的繁殖器官，也是昆虫的食物来源。",
    fact: "花朵进化出鲜艳颜色来吸引传粉者。",
  },
  // 初级消费者
  {
    id: "rabbit",
    name: "兔子",
    image: tuziImg,
    role: "consumer1",
    description: "兔子是草食动物，以植物为食。",
    fact: "兔子的长耳朵有助于散热和侦听天敌。",
  },
  {
    id: "deer",
    name: "鹿",
    image: luImg,
    role: "consumer1",
    description: "鹿是草食动物，主要吃树叶和嫩枝。",
    fact: "雄鹿每年都会换角。",
  },
  {
    id: "sheep",
    name: "羊",
    image: yangImg,
    role: "consumer1",
    description: "羊是典型的草食动物，以草为食。",
    fact: "羊是反刍动物，有四个胃室。",
  },
  // 次级消费者
  {
    id: "wolf",
    name: "狼",
    image: langImg,
    role: "consumer2",
    description: "狼是肉食动物，主要捕食草食动物。",
    fact: "狼通常群体行动，通过嚎叫沟通。",
  },
  {
    id: "fox",
    name: "狐狸",
    image: huliImg,
    role: "consumer2",
    description: "狐狸是杂食性动物，吃小型哺乳动物。",
    fact: "狐狸非常聪明，适应力极强。",
  },
  {
    id: "hawk",
    name: "鹰",
    image: yingImg,
    role: "consumer2",
    description: "鹰是猛禽，从高空俯冲捕猎。",
    fact: "鹰的视力非常敏锐，能看清数公里外的猎物。",
  },
];

// --- State ---
const showRules = ref(true);
const draggableOrganisms = ref<Organism[]>([]);
const placedOrganisms = reactive<{ [key in Role]: Organism | null }>({
  producer: null,
  consumer1: null,
  consumer2: null,
});
const draggedItem = ref<Organism | null>(null);
const isDragging = ref(false);
const activeDropZone = ref<Role | null>(null);
const dropZoneStatus = reactive<{ [key in Role]: "default" | "success" | "error" }>({
  producer: "default",
  consumer1: "default",
  consumer2: "default",
});
const toast = reactive({ visible: false, type: "info", title: "", message: "" });
const selectedOrganismInfo = ref<Organism | null>(null);

// --- Computed ---
const gameCompleted = computed(() => {
  return placedOrganisms.producer && placedOrganisms.consumer1 && placedOrganisms.consumer2;
});

// --- Methods ---

const initGame = () => {
  // Reset state
  placedOrganisms.producer = null;
  placedOrganisms.consumer1 = null;
  placedOrganisms.consumer2 = null;
  dropZoneStatus.producer = "default";
  dropZoneStatus.consumer1 = "default";
  dropZoneStatus.consumer2 = "default";
  selectedOrganismInfo.value = null;
  toast.visible = false;

  // Random selection logic
  const producers = shuffle(organismDatabase.filter(o => o.role === "producer")).slice(0, 1);
  const consumers1 = shuffle(organismDatabase.filter(o => o.role === "consumer1")).slice(0, 2);
  const consumers2 = shuffle(organismDatabase.filter(o => o.role === "consumer2")).slice(0, 3);

  draggableOrganisms.value = shuffle([...producers, ...consumers1, ...consumers2]);
};

const shuffle = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const handleDragStart = (e: DragEvent, organism: Organism) => {
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = "move";
    // Create a ghost element for custom drag image if needed, or rely on browser default
  }
  draggedItem.value = organism;
  isDragging.value = true;
};

const handleDragEnd = () => {
  draggedItem.value = null;
  isDragging.value = false;
  activeDropZone.value = null;
};

const handleDragEnter = (role: Role) => {
  activeDropZone.value = role;
};

const handleDragLeave = () => {
  activeDropZone.value = null;
};

const handleDrop = (role: Role) => {
  activeDropZone.value = null;
  const organism = draggedItem.value;

  if (!organism) return;

  // Check logic
  if (organism.role === role) {
    // Correct
    placedOrganisms[role] = organism;
    dropZoneStatus[role] = "success";
    selectedOrganismInfo.value = organism;

    // Remove from draggable list
    draggableOrganisms.value = draggableOrganisms.value.filter(o => o.id !== organism.id);

    // If there was an existing one, put it back (optional feature, currently overwrite)

    if (gameCompleted.value) {
      playSound("success");
    } else {
      playSound("drop");
    }
  } else {
    // Incorrect
    dropZoneStatus[role] = "error";
    showToast("error", "位置不对哦", `${organism.name} 不属于这个营养级。想想它是吃什么的？`);
    playSound("error");

    setTimeout(() => {
      dropZoneStatus[role] = "default";
    }, 1000);
  }
};

const removeOrganism = (role: Role) => {
  const organism = placedOrganisms[role];
  if (organism) {
    placedOrganisms[role] = null;
    dropZoneStatus[role] = "default";
    draggableOrganisms.value.push(organism);
    selectedOrganismInfo.value = null;
  }
};

const getZoneClass = (role: Role) => {
  const status = dropZoneStatus[role];
  const isActive = activeDropZone.value === role;

  if (status === "success") return "border-emerald-500 bg-emerald-50 border-solid";
  if (status === "error") return "border-red-400 bg-red-50 border-solid animate-shake";
  if (isActive) return "border-emerald-400 bg-emerald-50 scale-[1.02] border-dashed";

  return "border-slate-300 bg-slate-50 border-dashed hover:border-emerald-300";
};

const showToast = (type: string, title: string, message: string) => {
  toast.type = type;
  toast.title = title;
  toast.message = message;
  toast.visible = true;
  setTimeout(() => {
    toast.visible = false;
  }, 3000);
};

const showHint = () => {
  let msg = "";
  if (!placedOrganisms.producer) msg = "生产者通常是绿色植物，位于食物链最底端。";
  else if (!placedOrganisms.consumer1) msg = "初级消费者是吃植物的草食动物。";
  else if (!placedOrganisms.consumer2) msg = "次级消费者是捕食其他动物的肉食动物。";
  else msg = "你已经快完成了！";

  showToast("info", "提示", msg);
};

const resetGame = () => {
  initGame();
};

const getRoleLabel = (role: Role) => {
  const map: Record<Role, string> = {
    producer: "生产者",
    consumer1: "初级消费者",
    consumer2: "次级消费者",
  };
  return map[role];
};

const playSound = (type: "drop" | "success" | "error") => {
  // Placeholder for sound effects
  // console.log('Playing sound:', type);
};

onMounted(() => {
  initGame();
});
</script>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
.list-leave-active {
  position: absolute;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 100%);
}

.scale-enter-active {
  animation: bounce-in 0.5s;
}
.scale-leave-active {
  animation: bounce-in 0.5s reverse;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}
.animate-shake {
  animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
.animate-bounce-in {
  animation: bounce-in 0.5s;
}

/* Custom Scrollbar for organism list */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #d1fae5;
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #10b981;
}
</style>
