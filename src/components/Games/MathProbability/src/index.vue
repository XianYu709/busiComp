<template>
    <div class="min-h-screen font-sans bg-gray-50">
      <!-- 头部区域 -->
      <header class="bg-primary text-white shadow-lg">
        <div class="container mx-auto px-4 py-6">
          <h1 class="text-[clamp(1.8rem,4vw,2.5rem)] font-bold text-center">
            <i class="fa fa-ticket mr-3" aria-hidden="true"></i>抽奖概率模拟器
          </h1>
          <p class="text-center mt-2 text-blue-100">探索概率的奥秘，验证理论与实践的关系</p>
        </div>
      </header>
  
      <!-- 主内容区域 -->
      <main class="container mx-auto px-4 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- 左侧：参数设置区域 -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-xl p-6 card-shadow">
              <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <i class="fa fa-sliders mr-2 text-primary" aria-hidden="true"></i>抽奖参数设置
              </h2>
              <form class="space-y-4">
                <div>
                  <label for="totalTickets" class="block text-gray-700 mb-1 font-medium">奖券总数:</label>
                  <input 
                    type="number" 
                    id="totalTickets" 
                    v-model.number="totalTickets"
                    min="2" 
                    max="100"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-custom"
                  >
                  <p class="text-sm text-gray-500 mt-1">请输入2-100之间的整数</p>
                </div>
                
                <div>
                  <label for="winningTickets" class="block text-gray-700 mb-1 font-medium">中奖奖券数量:</label>
                  <input 
                    type="number" 
                    id="winningTickets" 
                    v-model.number="winningTickets"
                    min="1" 
                    max="99"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-custom"
                  >
                  <p class="text-sm text-gray-500 mt-1">请输入小于奖券总数的正整数</p>
                </div>
                
                <div>
                  <label for="drawCount" class="block text-gray-700 mb-1 font-medium">抽取奖券数量:</label>
                  <input 
                    type="number" 
                    id="drawCount" 
                    v-model.number="drawCount"
                    min="1" 
                    max="50"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-custom"
                  >
                  <p class="text-sm text-gray-500 mt-1">请输入小于奖券总数的正整数</p>
                </div>
                
                <div>
                  <label for="studentProbability" class="block text-gray-700 mb-1 font-medium">你的概率计算结果 (%):</label>
                  <input 
                    type="number" 
                    id="studentProbability" 
                    v-model.number="studentProbability"
                    min="0" 
                    max="100" 
                    step="0.01" 
                    placeholder="例如: 33.33"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-custom"
                  >
                  <p class="text-sm text-gray-500 mt-1">请输入0-100之间的数值，保留两位小数</p>
                </div>
                
                <button 
                  type="button" 
                  @click="runSimulation"
                  class="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg transition-custom flex items-center justify-center"
                >
                  <i class="fa fa-play-circle mr-2" aria-hidden="true"></i>运行模拟实验
                </button>
              </form>
            </div>
            
            <div class="bg-white rounded-xl p-6 card-shadow mt-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <i class="fa fa-lightbulb-o mr-2 text-accent" aria-hidden="true"></i>概率计算公式
              </h2>
              <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p class="text-center mb-2">至少抽到1张中奖奖券的概率:</p>
                <p class="text-center text-lg font-medium">P = 1 - C(n-k, m) / C(n, m)</p>
                <p class="mt-3 text-sm text-gray-600">
                  其中: n = 奖券总数, k = 中奖奖券数量, m = 抽取奖券数量<br>
                  C(a, b) 表示从a个元素中选取b个的组合数
                </p>
              </div>
            </div>
          </div>
          
          <!-- 右侧：结果显示区域 -->
          <div class="lg:col-span-2">
            <!-- 模拟过程显示 -->
            <div class="bg-white rounded-xl p-6 card-shadow mb-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <i class="fa fa-refresh mr-2 text-secondary" aria-hidden="true"></i>模拟过程
              </h2>
              <div 
                class="h-64 bg-gray-50 rounded-lg overflow-auto p-4 border border-gray-200"
                v-html="simulationProgress"
              ></div>
            </div>
            
            <!-- 结果对比 -->
            <div class="bg-white rounded-xl p-6 card-shadow mb-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <i class="fa fa-bar-chart mr-2 text-primary" aria-hidden="true"></i>结果对比
              </h2>
              <div class="h-80">
                <canvas id="resultChart"></canvas>
              </div>
            </div>
            
            <!-- 详细结果 -->
            <div class="bg-white rounded-xl p-6 card-shadow">
              <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <i class="fa fa-table mr-2 text-neutral" aria-hidden="true"></i>详细结果
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 class="text-sm text-blue-600 font-medium">理论概率</h3>
                  <p class="text-2xl font-bold text-primary mt-1">{{ theoreticalProbability }}</p>
                </div>
                <div class="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h3 class="text-sm text-green-600 font-medium">实验概率</h3>
                  <p class="text-2xl font-bold text-secondary mt-1">{{ experimentalProbability }}</p>
                </div>
                <div class="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <h3 class="text-sm text-amber-600 font-medium">你的答案</h3>
                  <p class="text-2xl font-bold text-accent mt-1">{{ studentAnswer }}</p>
                </div>
              </div>
              
              <div 
                class="mt-6 p-4 rounded-lg border" 
                :class="feedbackClass"
                v-if="showFeedback"
              >
                <h3 class="font-medium flex items-center">
                  <i :class="feedbackIcon" class="mr-2"></i>
                  <span :class="feedbackTitleClass">{{ feedbackTitle }}</span>
                </h3>
                <p class="mt-2">{{ feedbackMessage }}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
  
      <!-- 页脚 -->
      <footer class="bg-gray-800 text-white py-6 mt-12">
        <div class="container mx-auto px-4 text-center">
          <p>高中数学概率教学工具 | 抽奖概率模拟器</p>
          <p class="text-gray-400 text-sm mt-2">通过实践理解概率理论，提升数学思维能力</p>
        </div>
      </footer>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import Chart from 'chart.js/auto';
  
  // 常量定义
  const SIMULATION_COUNT = 1000; // 模拟实验次数
  
  // 状态变量
  const totalTickets = ref(10);
  const winningTickets = ref(2);
  const drawCount = ref(2);
  const studentProbability = ref<number | null>(null);
  const simulationProgress = ref('<p class="text-gray-500 text-center italic">点击"运行模拟实验"开始...</p>');
  const theoreticalProbability = ref('--');
  const experimentalProbability = ref('--');
  const studentAnswer = ref('--');
  const showFeedback = ref(false);
  const feedbackIcon = ref('');
  const feedbackTitle = ref('');
  const feedbackMessage = ref('');
  const feedbackClass = ref('');
  const feedbackTitleClass = ref('');
  
  // 图表实例
  let resultChart: Chart | null = null;
  
  // 初始化图表
  const initChart = () => {
    const ctx = document.getElementById('resultChart') as HTMLCanvasElement;
    
    // 如果图表已存在，先销毁
    if (resultChart) {
      resultChart.destroy();
    }
    
    resultChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['理论概率', '实验概率', '你的答案'],
        datasets: [{
          label: '概率 (%)',
          data: [0, 0, 0],
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',  // 蓝色 - 理论
            'rgba(16, 185, 129, 0.7)',  // 绿色 - 实验
            'rgba(245, 158, 11, 0.7)'   // 黄色 - 学生答案
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: '概率 (%)'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context: any) {
                return `概率: ${context.raw.toFixed(2)}%`;
              }
            }
          }
        }
      }
    });
  };
  
  // 计算组合数 C(n, k)
  const combination = (n: number, k: number): number => {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    if (k > n - k) k = n - k; // 取较小的k以减少计算量
    
    let result = 1;
    for (let i = 1; i <= k; i++) {
      result = result * (n - k + i) / i;
    }
    return result;
  };
  
  // 计算理论概率
  const calculateTheoreticalProbability = (total: number, winning: number, draw: number): number => {
    // 计算至少抽到1张中奖奖券的概率
    // P = 1 - C(total-winning, draw) / C(total, draw)
    const totalCombinations = combination(total, draw);
    if (totalCombinations === 0) return 0;
    
    const losingCombinations = combination(total - winning, draw);
    const probability = 1 - losingCombinations / totalCombinations;
    
    return probability * 100; // 转换为百分比
  };
  
  // 执行单次模拟抽奖
  const runSingleSimulation = (total: number, winning: number, draw: number): boolean => {
    // 创建奖券数组，true表示中奖
    const tickets = Array(total).fill(false);
    for (let i = 0; i < winning; i++) {
      tickets[i] = true;
    }
    
    // 随机打乱数组
    for (let i = tickets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tickets[i], tickets[j]] = [tickets[j], tickets[i]];
    }
    
    // 抽取前draw张奖券，检查是否至少有一张中奖
    for (let i = 0; i < draw; i++) {
      if (tickets[i]) {
        return true; // 中奖
      }
    }
    return false; // 未中奖
  };
  
  // 格式化概率显示
  const formatProbability = (prob: number): string => {
    return prob.toFixed(2) + '%';
  };
  
  // 显示反馈信息
  const showFeedbackMessage = (theoretical: number, student: number | null) => {
    showFeedback.value = true;
    
    if (student === null || isNaN(student)) {
      feedbackIcon.value = 'fa fa-info-circle text-blue-500';
      feedbackTitle.value = '信息';
      feedbackTitleClass.value = 'text-blue-500';
      feedbackMessage.value = '请输入你的概率计算结果以获得反馈。';
      feedbackClass.value = 'border border-blue-200 bg-blue-50';
      return;
    }
    
    const difference = Math.abs(theoretical - student);
    
    if (difference < 1) {
      feedbackIcon.value = 'fa fa-check-circle text-green-500';
      feedbackTitle.value = '太棒了！';
      feedbackTitleClass.value = 'text-green-500';
      feedbackMessage.value = `你的计算非常准确，与理论值仅相差${difference.toFixed(2)}%。`;
      feedbackClass.value = 'border border-green-200 bg-green-50';
    } else if (difference < 5) {
      feedbackIcon.value = 'fa fa-smile-o text-amber-500';
      feedbackTitle.value = '不错！';
      feedbackTitleClass.value = 'text-amber-500';
      feedbackMessage.value = `你的计算接近正确答案，与理论值相差${difference.toFixed(2)}%。`;
      feedbackClass.value = 'border border-amber-200 bg-amber-50';
    } else {
      feedbackIcon.value = 'fa fa-exclamation-circle text-red-500';
      feedbackTitle.value = '需要再检查一下';
      feedbackTitleClass.value = 'text-red-500';
      feedbackMessage.value = `你的计算与理论值相差${difference.toFixed(2)}%，可以再仔细计算一次。`;
      feedbackClass.value = 'border border-red-200 bg-red-50';
    }
  };
  
  // 更新图表数据
  const updateChart = (theoretical: number, experimental: number, student: number | null) => {
    if (resultChart) {
      resultChart.data.datasets[0].data = [
        theoretical || 0,
        experimental || 0,
        student || 0
      ];
      resultChart.update();
    }
  };
  
  // 运行模拟实验
  const runSimulation = async () => {
    // 验证输入
    if (isNaN(totalTickets.value) || totalTickets.value < 2) {
      alert('请输入有效的奖券总数（至少2张）');
      return;
    }
    
    if (isNaN(winningTickets.value) || winningTickets.value < 1 || winningTickets.value >= totalTickets.value) {
      alert('请输入有效的中奖奖券数量（至少1张且小于奖券总数）');
      return;
    }
    
    if (isNaN(drawCount.value) || drawCount.value < 1 || drawCount.value > totalTickets.value) {
      alert('请输入有效的抽取数量（至少1张且不超过奖券总数）');
      return;
    }
    
    // 重置进度区域
    simulationProgress.value = `
      <p class="text-gray-700">正在进行模拟实验...<br>这将运行1000次抽奖实验</p>
      <div class="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div class="h-full bg-primary" style="width: 0%" id="progressBar"></div>
      </div>
    `;
    
    // 计算理论概率
    const theoreticalProb = calculateTheoreticalProbability(
      totalTickets.value, 
      winningTickets.value, 
      drawCount.value
    );
    
    // 执行多次模拟
    let successCount = 0;
    
    // 显示前10次的详细过程
    let detailedLogs = '<div class="mt-4 text-sm"><p class="font-medium mb-2">前10次实验详情：</p><div class="grid grid-cols-2 gap-1">';
    
    for (let i = 0; i < SIMULATION_COUNT; i++) {
      const isSuccess = runSingleSimulation(
        totalTickets.value, 
        winningTickets.value, 
        drawCount.value
      );
      if (isSuccess) successCount++;
      
      // 更新进度条
      const progress = ((i + 1) / SIMULATION_COUNT) * 100;
      const progressBar = document.getElementById('progressBar');
      if (progressBar) {
        progressBar.style.width = progress + '%';
      }
      
      // 记录前10次的结果
      if (i < 10) {
        detailedLogs += `<div class="flex items-center ${isSuccess ? 'text-green-600' : 'text-red-600'}">
          第${i+1}次: ${isSuccess ? '<i class="fa fa-check-circle mr-1"></i>中奖' : '<i class="fa fa-times-circle mr-1"></i>未中奖'}
        </div>`;
      }
      
      // 每100次更新一次显示，避免UI阻塞
      if (i % 100 === 0) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    detailedLogs += '</div></div>';
    
    // 计算实验概率
    const experimentalProb = (successCount / SIMULATION_COUNT) * 100;
    
    // 更新显示结果
    theoreticalProbability.value = formatProbability(theoreticalProb);
    experimentalProbability.value = formatProbability(experimentalProb);
    studentAnswer.value = studentProbability.value !== null ? formatProbability(studentProbability.value) : '--';
    
    // 更新进度区域
    simulationProgress.value += `
      <p class="mt-4 text-gray-700">模拟实验完成！在${SIMULATION_COUNT}次实验中，成功${successCount}次，失败${SIMULATION_COUNT - successCount}次。</p>
      ${detailedLogs}
    `;
    
    // 更新图表
    updateChart(theoreticalProb, experimentalProb, studentProbability.value);
    
    // 显示反馈
    showFeedbackMessage(theoreticalProb, studentProbability.value);
  };
  
  // 初始化
  onMounted(() => {
    initChart();
  });
  </script>
  
  <style scoped>
  @layer utilities {
    .content-auto {
      content-visibility: auto;
    }
    .card-shadow {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    .transition-custom {
      transition: all 0.3s ease;
    }
  }
  
  /* 引入Tailwind颜色变量 */
  :root {
    --primary: #3b82f6;
    --secondary: #10b981;
    --accent: #f59e0b;
    --neutral: #64748b;
  }
  </style>