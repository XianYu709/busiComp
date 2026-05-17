<template>
  <div
    class="min-h-screen w-full overflow-hidden bg-[#faf9f6] font-serif text-[#4a3b2a] pb-12 relative select-none">
    <div
      class="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] z-0"></div>

    <header
      class="bg-[#8B4513] text-[#fdfbf7] shadow-lg sticky top-0 z-50 border-b-4 border-[#DAA520]">
      <div class="container mx-auto px-6 py-4 flex items-center justify-between w-96%">
        <div class="flex items-center gap-4">
          <div class="bg-[#5c2e0b] p-2.5 rounded-full border border-[#DAA520] shadow-inner">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-[#DAA520]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1
            class="text-2xl font-bold tracking-widest flex items-center gap-1"
            style="font-family: &quot;Kaiti SC&quot;, &quot;STKaiti&quot;, serif">
            朝代
            <span class="text-[#DAA520]">接龙</span>
          </h1>
        </div>

        <div class="hidden md:flex gap-6 text-sm font-bold tracking-wide">
          <div
            class="flex items-center gap-2 bg-[#5c2e0b]/40 px-5 py-1.5 rounded-full border border-[#DAA520]/20">
            <span class="text-[#DAA520]/80">进度</span>
            <span class="text-white font-mono text-base">
              {{ currentProgress }} / {{ dynasties.length }}
            </span>
          </div>
          <div
            class="flex items-center gap-2 bg-[#5c2e0b]/40 px-5 py-1.5 rounded-full border border-[#DAA520]/20">
            <span class="text-[#DAA520]/80">用时</span>
            <span class="text-white font-mono text-base">{{ formattedTime }}</span>
          </div>
        </div>

        <button
          @click="resetGame"
          class="md:hidden text-[#DAA520] hover:text-white transition-colors p-2">
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8 space-y-8 relative z-10 max-w-7xl">
      <div class="grid grid-cols-2 gap-4 md:hidden">
        <div
          class="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-sm border-l-4 border-[#8B4513] flex flex-col items-center">
          <span class="text-xs text-[#8B4513] font-bold mb-1">进度</span>
          <span class="text-xl font-bold text-[#5c2e0b] font-mono">
            {{ currentProgress }}
            <span class="text-[#8B4513]/40 text-sm">/{{ dynasties.length }}</span>
          </span>
        </div>
        <div
          class="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-sm border-l-4 border-[#DAA520] flex flex-col items-center">
          <span class="text-xs text-[#DAA520] font-bold mb-1">用时</span>
          <span class="text-xl font-bold text-[#5c2e0b] font-mono">{{ formattedTime }}</span>
        </div>
      </div>

      <div class="relative py-8 px-2 select-none">
        <div
          class="absolute top-1/2 left-0 w-full h-2 bg-[#eaddcf] rounded-full -translate-y-1/2 shadow-inner"></div>

        <div
          class="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-[#8B4513] to-[#DAA520] rounded-full -translate-y-1/2 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(218,165,32,0.4)]"
          :style="{ width: `${progressPercentage}%` }"></div>

        <div class="relative flex justify-between w-full px-[2px]">
          <div
            v-for="(dynasty, index) in dynasties"
            :key="'dot-' + dynasty.id"
            class="relative group">
            <div
              class="w-3 h-3 md:w-4 md:h-4 rounded-full border-2 transition-all duration-500 relative z-10 box-border"
              :class="[
                index < currentProgress
                  ? 'border-[#8B4513] bg-[#8B4513] scale-110'
                  : index === currentProgress
                    ? 'border-[#DAA520] bg-white animate-pulse scale-125 shadow-[0_0_0_4px_rgba(218,165,32,0.2)]'
                    : 'border-[#dcd3b2] bg-[#fdfbf7]',
              ]"></div>

            <div
              class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none w-max z-20 transform translate-y-2 group-hover:translate-y-0">
              <div
                class="bg-[#4a3b2a] text-[#fdfbf7] text-xs px-3 py-1.5 rounded shadow-xl border border-[#DAA520]">
                <div class="font-bold">{{ dynasty.name }}</div>
              </div>
              <div
                class="w-2 h-2 bg-[#4a3b2a] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-[#DAA520]"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div class="lg:col-span-8 space-y-6">
          <div class="flex items-center justify-between border-l-4 border-[#DAA520] pl-4 py-1">
            <h2
              class="text-xl md:text-2xl font-bold text-[#5c2e0b]"
              style="font-family: &quot;Kaiti SC&quot;, &quot;STKaiti&quot;, serif">
              历史长河
            </h2>
            <div class="text-sm text-[#8B4513]/60 italic">请选择历史上的下一个朝代</div>
          </div>

          <TransitionGroup
            tag="div"
            name="list"
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <div
              v-for="dynasty in shuffledOptions"
              :key="dynasty.id"
              @click="handleSelect(dynasty)"
              class="relative bg-white rounded-xl shadow-sm hover:shadow-md border border-[#e6dec3] hover:border-[#DAA520]/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group h-32 flex flex-col items-center justify-center p-4 text-center select-none"
              :class="{
                'ring-2 ring-[#CD5C5C] bg-[#fff5f5] border-[#CD5C5C] animate-shake':
                  errorId === dynasty.id,
              }">
              <div
                class="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#8B4513_1px,transparent_1px)] [background-size:16px_16px]"></div>

              <div class="relative z-10">
                <div
                  class="text-xl md:text-2xl font-bold text-[#5c2e0b] group-hover:text-[#8B4513] transition-colors mb-2"
                  style="font-family: &quot;Kaiti SC&quot;, &quot;STKaiti&quot;, serif">
                  {{ dynasty.name }}
                </div>
                <div
                  class="text-[10px] md:text-xs text-[#8B4513]/50 font-mono group-hover:text-[#8B4513]/80 transition-colors">
                  {{ dynasty.start }} - {{ dynasty.end }}
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <div class="lg:col-span-4 space-y-6">
          <div
            class="bg-white rounded-2xl shadow-lg border border-[#e6dec3] overflow-hidden sticky top-28">
            <div
              class="bg-[#8B4513] p-4 flex justify-between items-center relative overflow-hidden">
              <div
                class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10"></div>
              <h3 class="text-base font-bold text-[#DAA520] flex items-center gap-2 relative z-10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                当前朝代
              </h3>
              <button
                @click="resetGame"
                class="text-xs font-bold text-[#5c2e0b] bg-[#DAA520] hover:bg-[#FFD700] px-3 py-1 rounded-full transition-colors shadow-sm relative z-10 flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                重置
              </button>
            </div>

            <div
              class="p-6 min-h-[360px] flex flex-col items-center justify-center relative bg-[#fffdf5]">
              <Transition name="fade" mode="out-in">
                <div
                  v-if="lastCorrectDynasty"
                  :key="lastCorrectDynasty.id"
                  class="w-full space-y-6">
                  <div class="text-center pb-6 border-b border-dashed border-[#dcd3b2]">
                    <div
                      class="w-20 h-20 mx-auto bg-[#5c2e0b] text-[#fdfbf7] rounded-full flex items-center justify-center text-4xl font-bold shadow-[0_4px_10px_rgba(92,46,11,0.2)] mb-4 border-4 border-[#DAA520]"
                      style="font-family: &quot;Kaiti SC&quot;, &quot;STKaiti&quot;, serif">
                      {{ lastCorrectDynasty.name[0] }}
                    </div>
                    <h2
                      class="text-3xl font-bold text-[#5c2e0b]"
                      style="font-family: &quot;Kaiti SC&quot;, &quot;STKaiti&quot;, serif">
                      {{ lastCorrectDynasty.name }}
                    </h2>
                    <div
                      class="mt-2 inline-block px-3 py-1 bg-[#f5efd8] rounded text-xs text-[#8B4513] font-mono">
                      {{ lastCorrectDynasty.start }} — {{ lastCorrectDynasty.end }}
                    </div>
                  </div>

                  <div class="space-y-4 text-sm text-[#5c2e0b] px-2">
                    <div class="group">
                      <h4 class="text-[#DAA520] font-bold text-xs mb-1 uppercase tracking-wider">
                        都城
                      </h4>
                      <p
                        class="font-medium pl-2 border-l-2 border-[#dcd3b2] group-hover:border-[#DAA520] transition-colors">
                        {{ lastCorrectDynasty.capital }}
                      </p>
                    </div>
                    <div class="group">
                      <h4 class="text-[#DAA520] font-bold text-xs mb-1 uppercase tracking-wider">
                        简介
                      </h4>
                      <p
                        class="leading-relaxed pl-2 border-l-2 border-[#dcd3b2] group-hover:border-[#DAA520] transition-colors text-justify">
                        {{ lastCorrectDynasty.description }}
                      </p>
                    </div>
                  </div>
                </div>

                <div v-else class="flex flex-col items-center text-center text-[#dcd3b2]">
                  <div
                    class="w-24 h-24 bg-[#fdfbf7] rounded-full flex items-center justify-center mb-6 border-4 border-dashed border-[#e6dec3]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-10 w-10 opacity-60"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <p class="text-sm font-medium text-[#8B4513]/60 px-4">
                    请选择列表中的
                    <span class="text-[#DAA520] font-bold text-base mx-1">"夏朝"</span>
                    <br />
                    开始您的历史之旅
                  </p>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>

      <Transition name="fade">
        <div
          v-if="gameCompleted"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-[#4a3b2a]/60 backdrop-blur-sm" @click="resetGame"></div>
          <div
            class="bg-[#fdfbf7] rounded-2xl shadow-2xl p-8 max-w-sm w-full relative z-10 text-center border-t-8 border-[#DAA520]">
            <div
              class="w-20 h-20 mx-auto bg-gradient-to-br from-[#DAA520] to-[#B8860B] text-white rounded-full flex items-center justify-center mb-6 shadow-lg border-4 border-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h2
              class="text-2xl font-bold text-[#5c2e0b] mb-2"
              style="font-family: &quot;Kaiti SC&quot;, &quot;STKaiti&quot;, serif">
              历史长卷已绘成
            </h2>
            <p class="text-[#8B4513]/70 mb-8 text-sm">恭喜！您已成功梳理了五千年的朝代更迭。</p>

            <div
              class="bg-[#f5efd8] rounded-xl p-4 mb-8 grid grid-cols-2 gap-4 border border-[#e6dec3]">
              <div>
                <div class="text-[10px] text-[#8B4513]/50 uppercase font-bold tracking-wider mb-1">
                  总用时
                </div>
                <div class="text-xl font-mono text-[#5c2e0b] font-bold">{{ formattedTime }}</div>
              </div>
              <div class="border-l border-[#dcd3b2]">
                <div class="text-[10px] text-[#8B4513]/50 uppercase font-bold tracking-wider mb-1">
                  准确率
                </div>
                <div class="text-xl font-mono text-green-600 font-bold">100%</div>
              </div>
            </div>

            <button
              @click="resetGame"
              class="w-full bg-[#8B4513] hover:bg-[#5c2e0b] text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              重温历史
            </button>
          </div>
        </div>
      </Transition>

      <Transition name="slide-up">
        <div
          v-if="toastMessage"
          class="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-max max-w-[90vw]">
          <div
            class="bg-[#CD5C5C] text-white px-5 py-2.5 rounded-full shadow-xl flex items-center gap-3 border border-white/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="font-bold text-sm tracking-wide">{{ toastMessage }}</span>
          </div>
        </div>
      </Transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

interface Dynasty {
  id: string;
  name: string;
  start: string;
  end: string;
  capital: string;
  description: string;
}

const dynasties: Dynasty[] = [
  {
    id: "xia",
    name: "夏朝",
    start: "约前2070年",
    end: "约前1600年",
    capital: "阳城（今河南登封）",
    description: "中国史书记载的第一个世袭制朝代，由大禹建立，标志着“公天下”变为“家天下”。",
  },
  {
    id: "shang",
    name: "商朝",
    start: "约前1600年",
    end: "约前1046年",
    capital: "殷（今河南安阳）",
    description: "又称殷商，创造了璀璨的青铜文明，甲骨文是目前已知最早的成熟汉字体系。",
  },
  {
    id: "zhou",
    name: "周朝",
    start: "约前1046年",
    end: "前256年",
    capital: "镐京 / 洛邑",
    description: "中国历史上存在时间最长的朝代，制礼作乐，分封诸侯，后期分为春秋和战国时期。",
  },
  {
    id: "qin",
    name: "秦朝",
    start: "前221年",
    end: "前207年",
    capital: "咸阳",
    description: "中国历史上第一个大一统王朝，秦始皇统一度量衡、文字，建立了中央集权制度。",
  },
  {
    id: "han",
    name: "汉朝",
    start: "前202年",
    end: "220年",
    capital: "长安 / 洛阳",
    description: "分为西汉和东汉，开辟了丝绸之路，罢黜百家独尊儒术，奠定了汉文化的基础。",
  },
  {
    id: "sanguo",
    name: "三国",
    start: "220年",
    end: "280年",
    capital: "洛阳/成都/建业",
    description: "魏、蜀、吴三国鼎立，英雄辈出，是历史上著名的分裂割据时期。",
  },
  {
    id: "jin",
    name: "晋朝",
    start: "266年",
    end: "420年",
    capital: "洛阳 / 建康",
    description: "短暂统一后再次分裂，分为西晋和东晋，士族门阀政治盛行，书法艺术达到高峰。",
  },
  {
    id: "nanbeichao",
    name: "南北朝",
    start: "420年",
    end: "589年",
    capital: "建康 / 平城等",
    description: "南朝与北朝对峙，政权更迭频繁，但也促进了民族大融合和佛教艺术的发展。",
  },
  {
    id: "sui",
    name: "隋朝",
    start: "581年",
    end: "618年",
    capital: "大兴（西安）",
    description: "结束了长期的分裂局面，开创科举制，开凿京杭大运河，为唐朝盛世奠基。",
  },
  {
    id: "tang",
    name: "唐朝",
    start: "618年",
    end: "907年",
    capital: "长安",
    description: "中国封建社会的巅峰，万邦来朝，诗歌繁荣，具有极高的国际影响力，称“大唐盛世”。",
  },
  {
    id: "song",
    name: "宋朝",
    start: "960年",
    end: "1279年",
    capital: "开封 / 临安",
    description: "分为北宋和南宋，经济文化极度繁荣，四大发明中有三项在此期间成熟或应用。",
  },
  {
    id: "yuan",
    name: "元朝",
    start: "1271年",
    end: "1368年",
    capital: "大都（北京）",
    description: "由蒙古族建立的大一统王朝，疆域空前辽阔，推行行省制度，促进了东西方交流。",
  },
  {
    id: "ming",
    name: "明朝",
    start: "1368年",
    end: "1644年",
    capital: "南京 / 北京",
    description: "最后一个由汉族建立的封建王朝，郑和下西洋宣扬国威，修筑明长城，小说戏曲繁荣。",
  },
  {
    id: "qing",
    name: "清朝",
    start: "1644年",
    end: "1912年",
    capital: "北京",
    description: "中国最后一个封建王朝，前期有“康乾盛世”，后期闭关锁国，逐渐落后于西方。",
  },
];

const currentProgress = ref(0);
const shuffledOptions = ref<Dynasty[]>([]);
const lastCorrectDynasty = ref<Dynasty | null>(null);
const gameStartTime = ref<number | null>(null);
const currentTime = ref(0);
const timerInterval = ref<number | null>(null);
const errorId = ref<string | null>(null);
const toastMessage = ref<string | null>(null);
const gameCompleted = ref(false);

const progressPercentage = computed(() => {
  return (currentProgress.value / (dynasties.length - 1)) * 100;
});

const formattedTime = computed(() => {
  const mins = Math.floor(currentTime.value / 60)
    .toString()
    .padStart(2, "0");
  const secs = (currentTime.value % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
});

const initGame = () => {
  currentProgress.value = 0;
  lastCorrectDynasty.value = null;
  gameCompleted.value = false;
  currentTime.value = 0;
  if (timerInterval.value) clearInterval(timerInterval.value);
  timerInterval.value = null;
  gameStartTime.value = null;

  updateOptions();
};

const updateOptions = () => {
  if (currentProgress.value >= dynasties.length) return;

  const correctNext = dynasties[currentProgress.value];
  const remaining = dynasties.filter((d, i) => i > currentProgress.value);
  const pool = [correctNext, ...shuffleArray(remaining).slice(0, 5)];
  shuffledOptions.value = shuffleArray(pool);
};

const handleSelect = (selected: Dynasty) => {
  if (!gameStartTime.value) {
    gameStartTime.value = Date.now();
    timerInterval.value = window.setInterval(() => {
      currentTime.value++;
    }, 1000);
  }

  const correctDynasty = dynasties[currentProgress.value];

  if (selected.id === correctDynasty.id) {
    lastCorrectDynasty.value = selected;
    currentProgress.value++;
    errorId.value = null;
    toastMessage.value = null;

    if (currentProgress.value >= dynasties.length) {
      completeGame();
    } else {
      setTimeout(() => {
        updateOptions();
      }, 300);
    }
  } else {
    errorId.value = selected.id;
    showToast(`顺序错误！请寻找 ${lastCorrectDynasty.value?.name || "开端"} 之后的朝代。`);

    setTimeout(() => {
      errorId.value = null;
    }, 500);
  }
};

const showToast = (msg: string) => {
  toastMessage.value = msg;
  setTimeout(() => {
    toastMessage.value = null;
  }, 2500);
};

const completeGame = () => {
  if (timerInterval.value) clearInterval(timerInterval.value);
  gameCompleted.value = true;
};

const resetGame = () => {
  initGame();
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

onMounted(() => {
  initGame();
});

onUnmounted(() => {
  if (timerInterval.value) clearInterval(timerInterval.value);
});
</script>

<style scoped>
/* Disable horizontal scrolling */
body,
html {
  overflow-x: hidden;
  width: 100%;
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
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
</style>
