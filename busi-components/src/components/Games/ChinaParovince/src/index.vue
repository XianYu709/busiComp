<template>
    <div class="min-h-screen bg-slate-50 font-sans text-slate-700 pb-10">
      <header class="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg sticky top-0 z-20">
        <div class="container mx-auto py-4 flex justify-between items-center">
          <div class="flex items-center gap-3 ml-10px">
            <div class="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 class="text-xl md:text-2xl font-bold tracking-wide">中国地理拼图</h1>
          </div>
          <div class="text-sm bg-white/10 px-3 py-1 rounded-full mr-10px">初中地理互动课件</div>
        </div>
      </header>
  
      <main class="container mx-auto  py-6 space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex items-center gap-4 w-full md:w-auto">
            <div class="relative w-12 h-12 flex items-center justify-center">
              <svg class="transform -rotate-90 w-12 h-12">
                <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="4" fill="transparent" class="text-slate-100" />
                <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="4" fill="transparent" 
                  :stroke-dasharray="circumference" 
                  :stroke-dashoffset="circumference - (progress / 100) * circumference"
                  class="text-green-500 transition-all duration-500 ease-out" />
              </svg>
              <span class="absolute text-xs font-bold">{{ Math.round(progress) }}%</span>
            </div>
            <div>
              <div class="text-sm text-slate-500">完成进度</div>
              <div class="font-bold text-lg text-slate-800">
                <span class="text-green-600">{{ completedCount }}</span> / {{ provinces.length }}
              </div>
            </div>
          </div>
  
          <div class="flex gap-3 w-full md:w-auto">
            <button @click="showHint" 
              class="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-colors font-medium active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              提示
            </button>
            <button @click="resetGame" 
              class="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors font-medium active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              重置
            </button>
          </div>
        </div>
  
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[700px]">
          
          <div class="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden order-2 lg:order-1">
            <div class="p-4 bg-slate-50 border-b border-slate-100">
              <h2 class="font-bold text-slate-700 flex items-center gap-2">
                <span class="w-2 h-6 bg-blue-500 rounded-full"></span>
                省份碎片池
              </h2>
            </div>
            <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
                <div 
                  v-for="province in provinces" 
                  :key="province.id"
                  :draggable="!province.isCompleted"
                  @dragstart="handleDragStart(province, $event)"
                  @dragend="handleDragEnd"
                  class="relative group transition-all duration-300"
                  :class="[
                    province.isCompleted 
                      ? 'opacity-40 grayscale cursor-not-allowed bg-slate-100' 
                      : 'cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:shadow-md bg-blue-50 border-blue-100'
                  ]"
                >
                  <div class="p-3 rounded-xl border text-center">
                    <span class="font-medium" :class="province.isCompleted ? 'text-slate-400' : 'text-blue-700'">
                      {{ province.name }}
                    </span>
                    <div v-if="province.isCompleted" class="absolute top-1 right-1 text-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <div class="lg:col-span-6 bg-white rounded-2xl shadow-sm border border-slate-100 p-1 flex flex-col order-1 lg:order-2 relative group">
             <Transition name="fade">
              <div v-if="hintMessage" class="absolute top-6 left-1/2 -translate-x-1/2 z-30 bg-amber-500 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 animate-bounce-slight">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                {{ hintMessage }}
              </div>
            </Transition>
  
            <div class="relative w-full h-full bg-blue-50/50 rounded-xl overflow-hidden" ref="mapContainerRef">
              <div class="absolute inset-0 grid-bg opacity-30"></div>
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-96 w-96 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="0.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
              </div>
              <div class="relative w-full h-[600px] lg:h-full">
                <div 
                  v-for="province in provinces" 
                  :key="'target-' + province.id"
                  class="absolute transition-all duration-300 flex items-center justify-center text-xs text-center select-none"
                  :class="[
                    province.isCompleted 
                      ? 'bg-blue-500 text-white shadow-md z-10 scale-100' 
                      : 'border-2 border-dashed border-blue-200 hover:bg-blue-100/50 z-0',
                    highlightId === province.id ? 'ring-4 ring-amber-400 ring-opacity-50 bg-amber-100/50 animate-pulse' : ''
                  ]"
                  :style="{
                    top: province.position.top,
                    left: province.position.left,
                    width: province.size.width,
                    height: province.size.height,
                    borderRadius: getRandomRadius(province.id) // 增加一点不规则感
                  }"
                  @dragover.prevent
                  @dragenter.prevent="handleDragEnter"
                  @dragleave="handleDragLeave"
                  @drop="handleDrop(province, $event)"
                >
                  <span v-if="province.isCompleted" class="font-bold drop-shadow-sm">{{ province.name }}</span>
                </div>
              </div>
            </div>
          </div>
  
          <div class="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col order-3">
            <div class="p-4 bg-slate-50 border-b border-slate-100">
              <h2 class="font-bold text-slate-700 flex items-center gap-2">
                <span class="w-2 h-6 bg-cyan-500 rounded-full"></span>
                省份百科
              </h2>
            </div>
            
            <div class="p-6 flex-1 flex flex-col items-center justify-center text-center">
              <Transition name="slide-fade" mode="out-in">
                <div v-if="lastCompletedProvince" :key="lastCompletedProvince.id" class="w-full">
                  <div class="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-6">
                    {{ lastCompletedProvince.name[0] }}
                  </div>
                  <h3 class="text-2xl font-bold text-slate-800 mb-2">{{ lastCompletedProvince.name }}</h3>
                  <div class="space-y-4 mt-6 text-left bg-slate-50 p-4 rounded-xl">
                    <div class="flex items-start gap-3">
                      <div class="p-1.5 bg-red-100 text-red-600 rounded-lg mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <span class="text-xs text-slate-400 block">省会</span>
                        <span class="font-medium text-slate-700">{{ lastCompletedProvince.capital }}</span>
                      </div>
                    </div>
                    <div class="flex items-start gap-3">
                      <div class="p-1.5 bg-amber-100 text-amber-600 rounded-lg mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <div>
                        <span class="text-xs text-slate-400 block">特色</span>
                        <span class="font-medium text-slate-700 leading-relaxed">{{ lastCompletedProvince.feature }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div v-else class="text-slate-400">
                  <div class="w-24 h-24 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p>拖拽省份到地图上的<br>正确位置解锁信息</p>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </main>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  
  // --- 类型定义 ---
  interface Position {
    top: string;
    left: string;
  }
  
  interface Size {
    width: string;
    height: string;
  }
  
  interface Province {
    id: string;
    name: string;
    capital: string;
    feature: string;
    position: Position;
    size: Size;
    isCompleted: boolean;
  }
  
  // --- 数据状态 ---
  const hintMessage = ref<string>('');
  const highlightId = ref<string>('');
  const draggingId = ref<string | null>(null);
  const lastCompletedProvince = ref<Province | null>(null);
  
  // 初始化数据 (直接迁移自原HTML)
  const initialData: Omit<Province, 'isCompleted'>[] = [
    // 东北
    { id: 'heilongjiang', name: '黑龙江', capital: '哈尔滨', feature: '冰雪大世界，大兴安岭', position: { top: '8%', left: '65%' }, size: { width: '100px', height: '90px' } },
    { id: 'jilin', name: '吉林', capital: '长春', feature: '长白山，人参', position: { top: '18%', left: '65%' }, size: { width: '80px', height: '70px' } },
    { id: 'liaoning', name: '辽宁', capital: '沈阳', feature: '重工业基地，大连港', position: { top: '25%', left: '68%' }, size: { width: '80px', height: '60px' } },
    // 华北
    { id: 'neimenggu', name: '内蒙古', capital: '呼和浩特', feature: '草原，成吉思汗陵', position: { top: '15%', left: '40%' }, size: { width: '120px', height: '130px' } },
    { id: 'hebei', name: '河北', capital: '石家庄', feature: '承德避暑山庄', position: { top: '28%', left: '58%' }, size: { width: '70px', height: '60px' } },
    { id: 'beijing', name: '北京', capital: '北京', feature: '中国首都，故宫', position: { top: '26%', left: '60%' }, size: { width: '40px', height: '35px' } },
    { id: 'tianjin', name: '天津', capital: '天津', feature: '天津卫，狗不理包子', position: { top: '29%', left: '63%' }, size: { width: '35px', height: '30px' } },
    { id: 'shanxi', name: '山西', capital: '太原', feature: '平遥古城，煤矿资源', position: { top: '30%', left: '52%' }, size: { width: '60px', height: '60px' } },
    // 华东
    { id: 'shandong', name: '山东', capital: '济南', feature: '泰山，孔子故里', position: { top: '35%', left: '65%' }, size: { width: '70px', height: '60px' } },
    { id: 'jiangsu', name: '江苏', capital: '南京', feature: '苏州园林，经济发达', position: { top: '40%', left: '65%' }, size: { width: '60px', height: '50px' } },
    { id: 'shanghai', name: '上海', capital: '上海', feature: '国际大都市，东方明珠', position: { top: '42%', left: '70%' }, size: { width: '35px', height: '30px' } },
    { id: 'zhejiang', name: '浙江', capital: '杭州', feature: '西湖，阿里巴巴', position: { top: '43%', left: '73%' }, size: { width: '60px', height: '50px' } },
    { id: 'anhui', name: '安徽', capital: '合肥', feature: '黄山，徽派建筑', position: { top: '42%', left: '60%' }, size: { width: '60px', height: '50px' } },
    { id: 'fujian', name: '福建', capital: '福州', feature: '武夷山，厦门鼓浪屿', position: { top: '50%', left: '75%' }, size: { width: '55px', height: '60px' } },
    { id: 'jiangxi', name: '江西', capital: '南昌', feature: '庐山，井冈山', position: { top: '48%', left: '65%' }, size: { width: '55px', height: '55px' } },
    { id: 'taiwan', name: '台湾', capital: '台北', feature: '阿里山，日月潭', position: { top: '55%', left: '90%' }, size: { width: '45px', height: '55px' } },
    // 中南
    { id: 'henan', name: '河南', capital: '郑州', feature: '少林寺，龙门石窟', position: { top: '45%', left: '55%' }, size: { width: '65px', height: '60px' } },
    { id: 'hubei', name: '湖北', capital: '武汉', feature: '黄鹤楼，长江三峡', position: { top: '50%', left: '58%' }, size: { width: '60px', height: '55px' } },
    { id: 'hunan', name: '湖南', capital: '长沙', feature: '张家界，橘子洲头', position: { top: '55%', left: '58%' }, size: { width: '55px', height: '60px' } },
    { id: 'guangdong', name: '广东', capital: '广州', feature: '珠江三角洲，粤菜', position: { top: '63%', left: '70%' }, size: { width: '70px', height: '60px' } },
    { id: 'guangxi', name: '广西', capital: '南宁', feature: '桂林山水，壮族文化', position: { top: '65%', left: '62%' }, size: { width: '60px', height: '65px' } },
    { id: 'hainan', name: '海南', capital: '海口', feature: '三亚，热带风光', position: { top: '80%', left: '72%' }, size: { width: '40px', height: '30px' } },
    { id: 'xianggang', name: '香港', capital: '香港', feature: '维多利亚港，国际金融中心', position: { top: '68%', left: '75%' }, size: { width: '25px', height: '20px' } },
    { id: 'aomen', name: '澳门', capital: '澳门', feature: '赌场，历史城区', position: { top: '69%', left: '73%' }, size: { width: '20px', height: '15px' } },
    // 西南
    { id: 'sichuan', name: '四川', capital: '成都', feature: '大熊猫，九寨沟', position: { top: '55%', left: '40%' }, size: { width: '75px', height: '70px' } },
    { id: 'chongqing', name: '重庆', capital: '重庆', feature: '山城，火锅', position: { top: '58%', left: '48%' }, size: { width: '40px', height: '40px' } },
    { id: 'guizhou', name: '贵州', capital: '贵阳', feature: '黄果树瀑布，遵义会议', position: { top: '63%', left: '50%' }, size: { width: '55px', height: '50px' } },
    { id: 'yunnan', name: '云南', capital: '昆明', feature: '丽江古城，西双版纳', position: { top: '70%', left: '45%' }, size: { width: '70px', height: '80px' } },
    { id: 'xizang', name: '西藏', capital: '拉萨', feature: '布达拉宫，珠穆朗玛峰', position: { top: '30%', left: '15%' }, size: { width: '80px', height: '180px' } },
    // 西北
    { id: 'shaanxi', name: '陕西', capital: '西安', feature: '兵马俑，古城墙', position: { top: '40%', left: '43%' }, size: { width: '60px', height: '60px' } },
    { id: 'gansu', name: '甘肃', capital: '兰州', feature: '莫高窟，丝绸之路', position: { top: '38%', left: '30%' }, size: { width: '60px', height: '100px' } },
    { id: 'qinghai', name: '青海', capital: '西宁', feature: '青海湖，三江源', position: { top: '35%', left: '25%' }, size: { width: '70px', height: '60px' } },
    { id: 'ningxia', name: '宁夏', capital: '银川', feature: '贺兰山，回族文化', position: { top: '45%', left: '35%' }, size: { width: '40px', height: '35px' } },
    { id: 'xinjiang', name: '新疆', capital: '乌鲁木齐', feature: '天山，吐鲁番葡萄', position: { top: '25%', left: '5%' }, size: { width: '90px', height: '160px' } },
  ];
  
  const provinces = ref<Province[]>(
    initialData.map(p => ({ ...p, isCompleted: false }))
  );
  
  // --- 计算属性 ---
  const completedCount = computed(() => provinces.value.filter(p => p.isCompleted).length);
  const progress = computed(() => (completedCount.value / provinces.value.length) * 100);
  const circumference = 20 * 2 * Math.PI;
  
  // --- 逻辑方法 ---
  
  const getRandomRadius = (id: string) => {
    // 生成一个确定的随机圆角，让方块看起来没那么生硬，模拟地图块
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `${hash % 5 + 3}px ${hash % 7 + 3}px ${hash % 4 + 3}px ${hash % 6 + 3}px`;
  }
  
  // 开始拖拽
  const handleDragStart = (province: Province, event: DragEvent) => {
    if (province.isCompleted) {
      event.preventDefault();
      return;
    }
    draggingId.value = province.id;
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', province.id);
    }
  };
  
  // 放置处理
  const handleDrop = (targetProvince: Province, event: DragEvent) => {
    const droppedId = event.dataTransfer?.getData('text/plain');
    
    if (droppedId === targetProvince.id) {
      // 匹配成功
      const province = provinces.value.find(p => p.id === droppedId);
      if (province) {
        province.isCompleted = true;
        lastCompletedProvince.value = province;
        playSound('success');
        
        // 检查是否全部完成
        if (completedCount.value === provinces.value.length) {
          setTimeout(() => alert('🎉 恭喜！你已完成中国地图拼图！'), 500);
        }
      }
    } else {
      // 匹配失败反馈
      playSound('error');
      hintMessage.value = '位置不对哦，再试试看！';
      setTimeout(() => hintMessage.value = '', 2000);
    }
    
    draggingId.value = null;
    // 清除高亮
    const el = event.target as HTMLElement;
    el.classList.remove('bg-blue-100/50');
  };
  
  const handleDragEnter = (event: Event) => {
    const el = event.target as HTMLElement;
    if (!el.classList.contains('bg-blue-500')) { // 如果不是已完成的
      el.classList.add('bg-blue-100/50');
    }
  }
  
  const handleDragLeave = (event: Event) => {
    const el = event.target as HTMLElement;
    el.classList.remove('bg-blue-100/50');
  }
  
  const handleDragEnd = () => {
    draggingId.value = null;
  }
  
  // 提示功能
  const showHint = () => {
    const incomplete = provinces.value.filter(p => !p.isCompleted);
    if (incomplete.length === 0) return;
    
    const random = incomplete[Math.floor(Math.random() * incomplete.length)];
    highlightId.value = random.id;
    hintMessage.value = `试试找找：${random.name}`;
    
    setTimeout(() => {
      highlightId.value = '';
      hintMessage.value = '';
    }, 3000);
  };
  
  // 重置游戏
  const resetGame = () => {
    if (confirm('确定要重置当前进度吗？')) {
      provinces.value.forEach(p => p.isCompleted = false);
      lastCompletedProvince.value = null;
      hintMessage.value = '';
    }
  };
  
  // 简单的音效模拟 (可选)
  const playSound = (type: 'success' | 'error') => {
    // 实际项目中可接入 Audio API
    console.log(`Playing ${type} sound`);
  };
  
  </script>
  
  <style scoped>
  /* 自定义滚动条 */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #94a3b8;
  }
  
  /* 背景网格样式 */
  .grid-bg {
    background-size: 20px 20px;
    background-image: 
      linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
  }
  
  /* 动画效果 */
  .slide-fade-enter-active {
    transition: all 0.4s ease-out;
  }
  .slide-fade-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
  }
  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateX(20px);
    opacity: 0;
  }
  
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  
  @keyframes bounce-slight {
    0%, 100% { transform: translate(-50%, -5%); }
    50% { transform: translate(-50%, 0); }
  }
  .animate-bounce-slight {
    animation: bounce-slight 2s infinite;
  }
  </style>