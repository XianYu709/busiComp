<template>
    <div class="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12 w-100%">
      <header class="bg-blue-600 text-white shadow-lg sticky top-0 z-20">
        <div class="container mx-auto py-4 flex items-center justify-between w-96%">
          <div class="flex items-center gap-3">
            <div class="bg-blue-700 p-2 rounded-full border border-blue-400/30">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <h1 class="text-xl md:text-2xl font-bold tracking-wide">
              杠杆平衡 <span class="font-light text-blue-200">挑战</span>
            </h1>
          </div>
          <button @click="showRules = true" class="text-sm font-medium bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            原理
          </button>
        </div>
      </header>
  
      <main class="container mx-auto m-1 space-y-6">
        <Transition name="fade">
          <div v-if="showRules" class="bg-white rounded-xl ml-20px mt-10px shadow-md border-l-4 border-blue-500 p-5 relative overflow-hidden w-95%">
            <button @click="showRules = false" class="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <h2 class="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              杠杆平衡原理
            </h2>
            <p class="text-sm text-slate-600 mb-4 leading-relaxed">
              杠杆平衡的条件是：<span class="font-bold text-blue-600">动力 × 动力臂 = 阻力 × 阻力臂</span>。即左侧力矩等于右侧力矩时，杠杆保持水平平衡。
            </p>
            <div class="flex flex-wrap gap-3 text-xs font-medium">
              <div class="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                <span class="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                <span class="text-blue-800">左侧 (动力 F₁)</span>
              </div>
              <div class="flex items-center gap-1.5 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                <span class="w-2.5 h-2.5 bg-orange-500 rounded-full"></span>
                <span class="text-orange-800">右侧 (阻力 F₂)</span>
              </div>
            </div>
          </div>
        </Transition>
  
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 w-98% ml-10px">
          
          <div class="bg-white rounded-xl shadow-sm border border-blue-100 p-5 h-fit">
            <h3 class="font-bold text-blue-800 mb-4 border-b border-blue-50 pb-2 text-center">左侧物体 (动力)</h3>
            
            <div class="space-y-6">
              <div>
                <div class="flex justify-between text-sm mb-2">
                  <span class="font-medium text-slate-600">重量 (N)</span>
                  <span class="font-bold text-blue-600 font-mono">{{ leftState.weight }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <button @click="adjustLeft('weight', -1)" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  <input type="range" v-model.number="leftState.weight" min="1" max="10" class="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600">
                  <button @click="adjustLeft('weight', 1)" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
  
              <div>
                <div class="flex justify-between text-sm mb-2">
                  <span class="font-medium text-slate-600">距离 (L)</span>
                  <span class="font-bold text-blue-600 font-mono">{{ leftState.distance }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <button @click="adjustLeft('distance', -1)" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  <input type="range" v-model.number="leftState.distance" min="1" max="5" class="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600">
                  <button @click="adjustLeft('distance', 1)" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
  
              <div class="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                <div class="text-xs text-blue-400 mb-1">左侧力矩</div>
                <div class="text-xl font-mono font-bold text-blue-700">{{ leftTorque }} <span class="text-xs font-normal text-blue-400">N·m</span></div>
              </div>
            </div>
          </div>
  
          <div class="lg:col-span-1 flex flex-col justify-center gap-6 order-first lg:order-none">
            <div class="bg-white rounded-xl shadow-md border border-slate-200 p-6 relative h-[320px] overflow-hidden flex flex-col items-center justify-end">
              <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-20 pointer-events-none"></div>
              
              <div 
                class="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm transition-all duration-300"
                :class="isBalanced ? 'bg-green-100 text-green-700 ring-2 ring-green-500' : 'bg-slate-100 text-slate-500'"
              >
                {{ isBalanced ? '✨ 平衡达成 ✨' : '未平衡' }}
              </div>
  
              <div class="relative w-full h-[200px] flex justify-center items-end pb-8">
                
                <div class="absolute bottom-8 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[30px] border-b-slate-600 z-10"></div>
  
                <div 
                  class="absolute bottom-[38px] w-full h-2 bg-slate-700 rounded-full transition-transform duration-700 ease-out shadow-lg origin-center"
                  :style="{ transform: `rotate(${leverAngle}deg)` }"
                >
                  <div class="absolute inset-0 flex justify-between items-center px-[10%]">
                    <div v-for="i in 5" :key="'l-'+i" class="w-0.5 h-1.5 bg-slate-400"></div>
                    <div class="w-1 h-3 bg-slate-400"></div> <div v-for="i in 5" :key="'r-'+i" class="w-0.5 h-1.5 bg-slate-400"></div>
                  </div>
  
                  <div 
                    class="absolute bottom-2 -translate-x-1/2 transition-all duration-300"
                    :style="{ left: `${50 - (leftState.distance * 8.33)}%` }"
                  >
                    <div 
                      class="bg-blue-500 rounded shadow-md flex items-center justify-center text-white font-bold text-xs transition-all duration-300 border border-blue-600"
                      :style="{ width: `${30 + leftState.weight * 3}px`, height: `${30 + leftState.weight * 3}px` }"
                    >
                      {{ leftState.weight }}
                    </div>
                    <div class="w-0.5 h-4 bg-slate-400 mx-auto -mt-1"></div>
                  </div>
  
                  <div 
                    class="absolute bottom-2 -translate-x-1/2 transition-all duration-300"
                    :style="{ left: `${50 + (rightState.distance * 8.33)}%` }"
                  >
                    <div 
                      class="bg-orange-500 rounded shadow-md flex items-center justify-center text-white font-bold text-xs transition-all duration-300 border border-orange-600"
                      :style="{ width: `${30 + rightState.weight * 3}px`, height: `${30 + rightState.weight * 3}px` }"
                    >
                      {{ rightState.weight }}
                    </div>
                    <div class="w-0.5 h-4 bg-slate-400 mx-auto -mt-1"></div>
                  </div>
                </div>
  
              </div>
  
              <div class="absolute bottom-2 left-0 right-0 text-center">
                <div class="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg text-xs font-mono text-slate-500 border border-slate-200">
                  <span :class="{'text-blue-600 font-bold': leftTorque > rightTorque}">{{ leftTorque }}</span>
                  <span>{{ isBalanced ? '=' : (leftTorque > rightTorque ? '>' : '<') }}</span>
                  <span :class="{'text-orange-600 font-bold': rightTorque > leftTorque}">{{ rightTorque }}</span>
                </div>
              </div>
  
            </div>
          </div>
  
          <div class="bg-white rounded-xl shadow-sm border border-orange-100 p-5 h-fit">
            <h3 class="font-bold text-orange-800 mb-4 border-b border-orange-50 pb-2 text-center">右侧物体 (阻力)</h3>
            
            <div class="space-y-6">
              <div>
                <div class="flex justify-between text-sm mb-2">
                  <span class="font-medium text-slate-600">重量 (N)</span>
                  <span class="font-bold text-orange-600 font-mono">{{ rightState.weight }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <button @click="adjustRight('weight', -1)" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  <input type="range" v-model.number="rightState.weight" min="1" max="10" class="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500">
                  <button @click="adjustRight('weight', 1)" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
  
              <div>
                <div class="flex justify-between text-sm mb-2">
                  <span class="font-medium text-slate-600">距离 (L)</span>
                  <span class="font-bold text-orange-600 font-mono">{{ rightState.distance }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <button @click="adjustRight('distance', -1)" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  <input type="range" v-model.number="rightState.distance" min="1" max="5" class="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500">
                  <button @click="adjustRight('distance', 1)" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
  
              <div class="bg-orange-50 rounded-lg p-3 text-center border border-orange-100">
                <div class="text-xs text-orange-400 mb-1">右侧力矩</div>
                <div class="text-xl font-mono font-bold text-orange-700">{{ rightTorque }} <span class="text-xs font-normal text-orange-400">N·m</span></div>
              </div>
            </div>
          </div>
  
        </div>
  
        <Transition name="scale">
          <div v-if="gameCompleted" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-900/20 backdrop-blur-sm">
            <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center relative animate-bounce-in border-t-8 border-emerald-500">
              <div class="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="text-4xl">⚖️</span>
              </div>
              <h2 class="text-2xl font-bold text-slate-800 mb-2">平衡达成！</h2>
              <p class="text-slate-500 mb-6 text-sm">左侧力矩 ({{ leftTorque }}) 等于 右侧力矩 ({{ rightTorque }})。</p>
              
              <button 
                @click="resetGame"
                class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v3.25a1 1 0 11-2 0V13.003a7.002 7.002 0 01-11.603-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                </svg>
                再来一次
              </button>
            </div>
          </div>
        </Transition>
  
      </main>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, computed, onMounted, watch } from 'vue';
  
  // --- State ---
  const showRules = ref(true);
  const gameCompleted = ref(false);
  
  const leftState = reactive({
    weight: 5,
    distance: 2
  });
  
  const rightState = reactive({
    weight: 5,
    distance: 4
  });
  
  // --- Computed ---
  const leftTorque = computed(() => leftState.weight * leftState.distance);
  const rightTorque = computed(() => rightState.weight * rightState.distance);
  const isBalanced = computed(() => leftTorque.value === rightTorque.value);
  
  // Calculates the rotation angle based on torque difference
  // Positive angle = Rotate clockwise (Right side down)
  // Negative angle = Rotate counter-clockwise (Left side down)
  const leverAngle = computed(() => {
    if (isBalanced.value) return 0;
    
    const diff = rightTorque.value - leftTorque.value;
    // Sensitivity factor: how much the lever tilts per unit of torque difference
    // Clamped to +/- 20 degrees for visual sanity
    const maxAngle = 20; 
    // Non-linear scaling for better feel (small differences tilt a bit, large ones tilt max)
    const angle = Math.sign(diff) * Math.min(Math.abs(diff) * 2, maxAngle); 
    
    return angle;
  });
  
  // --- Methods ---
  
  const adjustLeft = (type: 'weight' | 'distance', delta: number) => {
    if (type === 'weight') {
      const newVal = leftState.weight + delta;
      if (newVal >= 1 && newVal <= 10) leftState.weight = newVal;
    } else {
      const newVal = leftState.distance + delta;
      if (newVal >= 1 && newVal <= 5) leftState.distance = newVal;
    }
  };
  
  const adjustRight = (type: 'weight' | 'distance', delta: number) => {
    if (type === 'weight') {
      const newVal = rightState.weight + delta;
      if (newVal >= 1 && newVal <= 10) rightState.weight = newVal;
    } else {
      const newVal = rightState.distance + delta;
      if (newVal >= 1 && newVal <= 5) rightState.distance = newVal;
    }
  };
  
  const resetGame = () => {
    // Randomize initial state to force user to solve it
    leftState.weight = Math.floor(Math.random() * 5) + 3; // 3-7
    leftState.distance = Math.floor(Math.random() * 3) + 2; // 2-4
    
    // Ensure start state is unbalanced
    do {
      rightState.weight = Math.floor(Math.random() * 5) + 3;
      rightState.distance = Math.floor(Math.random() * 3) + 2;
    } while (leftState.weight * leftState.distance === rightState.weight * rightState.distance);
    
    gameCompleted.value = false;
  };
  
  // Check for win condition with a small delay
  watch(isBalanced, (balanced) => {
    if (balanced) {
      setTimeout(() => {
        gameCompleted.value = true;
      }, 800); // Wait for animation to settle
    }
  });
  
  onMounted(() => {
    resetGame();
  });
  </script>
  
  <style scoped>
  /* Animations */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  
  .scale-enter-active {
    animation: bounce-in 0.5s;
  }
  .scale-leave-active {
    animation: bounce-in 0.5s reverse;
  }
  
  @keyframes bounce-in {
    0% { transform: scale(0); opacity: 0; }
    60% { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1); }
  }
  
  .animate-bounce-in {
    animation: bounce-in 0.5s;
  }
  </style>