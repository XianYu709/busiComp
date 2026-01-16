<template>
  <div>
    <Table v-if="type === 'table'" />
    <div v-else-if="type === 'bar'" ref="barChartRef" :style="{ height: '250px' }"></div>
    <div v-else-if="type === 'line'" ref="lineChatRef" :style="{ height: '250px' }"></div>
    <div v-else-if="type === 'box'" ref="boxChatRef" :style="{ height: '250px' }"></div>
    <div v-else-if="type === 'level'" ref="levelChatRef" :style="{ height: '250px' }"></div>
    <div v-else-if="type === 'radar'" ref="radarChatRef" :style="{ height: '400px' }"></div>
    <!-- <div v-else-if="type === 'pie'" ref="pieChatRef" :style="{ height: '400px' }"></div> -->
  </div>
</template>

<script setup lang="tsx" name="TableWithEcharts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch, defineExpose, computed } from "vue";
import { useTable } from "../../JSONComp/src/ApiTable";
import * as echarts from "echarts";
import { echartsResize } from "@sjjb/utils";

const props = withDefaults(
  defineProps<{
    fields: any[];
    type: "table" | "bar" | "line" | "box" | "level" | "radar" | "pie";
    extraParams?: Object;
    data?: any[];
    colsData?: any[];
    api: () => Promise<any>;
    cols: any[];
    itemLabelField: string;
    showDialogType: number;
    rankSelectValue: number;
  }>(),
  { type: "bar" } as const,
);

const showDialogType = props.showDialogType
// console.log("展示图表类型", showDialogType)

// 添加 Promise 缓存
let dataPromise: Promise<any> | null = null;
const data = ref({});
const dataApi = async () => {
  // 如果已有数据，直接返回
  if (Object.keys(data.value).length > 0) return data.value;

  // 如果正在请求，返回同一个 Promise （去重）
  if (dataPromise) {
    return dataPromise;
  }

  // 发起新请求
  dataPromise = props.api().then(res => {
    if (!res || res.rows.length === 0) {
      data.value = { rows: [] };
    } else {
      data.value = res;
    }
    return data.value;
  }).finally(() => {
    dataPromise = null; // 清除 Promise 引用
  });
  return dataPromise;

  // const res = await props.api();
  // console.log("resresresres",res)
  // if (!res || res.rows.length === 0) return { rows: [] };
  // data.value = res;
  // return res;
};

// const [Table, tabIns] = useTable({
//   border: true,
//   api: dataApi,
//   columns: props.cols,
//   data: props.colsData
// });

const tableConfig = computed(() => {
  return useTable({
    border: true,
    api: dataApi,
    columns: props.cols || [],  // 使用 || [] 避免undefined
    data: props.colsData
  });
});

const Table = computed(() => tableConfig.value[0]);
const tabIns = computed(() => tableConfig.value[1]);

// echarts  柱状图
const barChartRef = ref(null);
let myBarChart: any = null;
const initBarChart = async () => {
  const rawData = await dataApi();
  // 移除数据长度检查，确保即使没有数据也创建图表
  // console.log("图标接口",rawData)

  if (!barChartRef.value) return; // 确保有DOM
  if (myBarChart) myBarChart.dispose();   // 销毁已有图表
  myBarChart = echarts.init(barChartRef.value);

  // 从接口数据生成图表数据源
  let chartSource = [
    ['product', '最高分', '最低分', '平均分'] // 表头
  ];

  // 如果有数据，添加数据行
  if (rawData?.rows?.length) {
    chartSource = [
      ['product', '最高分', '最低分', '平均分'], // 表头
      ...rawData.rows.map((row: { subjectName: any; groupName: any; maxScore: any; minScore: any; avgScore: any; }) => [
        row?.subjectName || row?.groupName, // x轴类目（学科名）
        row.maxScore,    // 最高分
        row.minScore,    // 最低分
        row.avgScore     // 平均分
      ])
    ];
  } else {
    // 没有数据时添加空数据行
    chartSource.push(['暂无数据', '0', '0', '0']);
  }

  myBarChart.setOption({
    legend: {
      data: ['最高分', '最低分', '平均分'], // 与dataset表头第二、三、四列对应
      top: 10
    },
    tooltip: {
      trigger: 'axis', // 按坐标轴触发（鼠标移到科目时显示该科目所有指标）
      axisPointer: { type: 'shadow' }, // 阴影指示器
      formatter: function (params: any[]) {
        // 如果是暂无数据状态
        if (params[0].name === '暂无数据') {
          return '暂无数据';
        }
        // params是当前类目下所有系列的数据数组（如语文的最高分、最低分、平均分）
        // 第一个元素的name是类目名（如"语文"）
        let html = `${params[0].name}<br/>`;
        // 遍历每个指标，拼接"指标名: 值"
        params.forEach((item, index) => {
          // 转换数值类型（原始数据是字符串，如'95'→95）
          let value = Number(item.value[index + 1]);
          html += `${item.seriesName}: ${value}<br/>`;
        });
        return html;
      }
    },
    dataset: {
      source: chartSource
    },
    xAxis: { type: 'category' },
    yAxis: {},
    series: [
      {
        type: 'bar',
        name: '最高分',
        itemStyle: {
          opacity: rawData?.rows?.length ? 1 : 0 // 无数据时隐藏柱子
        }
      },
      {
        type: 'bar',
        name: '最低分',
        itemStyle: {
          opacity: rawData?.rows?.length ? 1 : 0 // 无数据时隐藏柱子
        }
      },
      {
        type: 'bar',
        name: '平均分',
        itemStyle: {
          opacity: rawData?.rows?.length ? 1 : 0 // 无数据时隐藏柱子
        }
      }
    ]
  })

  echartsResize(myBarChart);
}

// 折线图
const lineChatRef = ref(null);
let myLineChart: any = null;
const initlineChart = async () => {
  const inteData = await dataApi();
  // 移除数据长度检查，确保即使没有数据也创建图表
  // console.log("echarts接口返回值",inteData)

  // 确保DOM元素已存在
  if (!lineChatRef.value) return;
  // 销毁已存在的图表实例
  if (myLineChart) myLineChart.dispose();
  // 创建新图表实例
  myLineChart = echarts.init(lineChatRef.value);

  let nameArr: any[] = []
  let scoreArr: any[] = []

  // 检查是否有数据
  if (inteData.data?.length) {
    inteData.data.forEach((item: { homeworkName: any; gradeAvgScore: any; }) => {
      nameArr.push(item.homeworkName)
      scoreArr.push(item.gradeAvgScore)
    });
  }

  let ecdata = {
    "homeworkNames": nameArr.length > 0 ? nameArr : ["暂无数据"],
    "gradeAvgScore": scoreArr.length > 0 ? scoreArr : [0],
    "className": inteData.data?.length ? inteData.data[0].className : "默认班级"
  }

  myLineChart.setOption({
    // 提示框配置
    tooltip: {
      trigger: 'item',
      formatter: function (params: { name: any; value: any; }) {
        if (ecdata.homeworkNames[0] === "暂无数据") {
          return "暂无数据";
        }
        return `${params.name}<br/> ${ecdata.className}: ${params.value}`;
      },
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      textStyle: {
        color: '#fff'
      },
      borderRadius: 4
    },
    // 图例配置
    legend: {
      data: [ecdata.className],
      top: 10,
      left: 'center',
      textStyle: {
        color: '#333'
      }
    },
    // 网格配置
    grid: {
      left: '2%',
      right: '10%',
      bottom: '5%',
    },
    // x轴配置
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ecdata.homeworkNames,
      axisLabel: {
        rotate: -45, // 标签旋转，防止重叠
        interval: 0, // 强制显示所有标签
        fontSize: 12
      },
    },
    // y轴配置
    yAxis: {
      type: 'value',
      min: 0,
      // max: 1,
      // interval: 0.2, // 刻度间隔
      splitLine: {
        // lineStyle: {
        //   type: 'dashed' // 虚线网格
        // }
      },
      // axisLabel: { // 设置Y轴标签
      //   show: true
      // },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#333', // Y轴颜色
          minWidth: 2, // Y轴线宽
          type: 'solid' // Y轴线条类型，设置为'solid'为实线
        }
      }
    },
    // 系列数据配置
    series: [
      {
        name: ecdata.className,
        type: 'line',
        smooth: true,  //曲线设置
        data: ecdata.gradeAvgScore, // 所有数据点的值都是0
        symbol: 'circle', // 数据点形状
        symbolSize: ecdata.homeworkNames[0] === "暂无数据" ? 0 : 8, // 无数据时隐藏数据点
        lineStyle: {
          width: ecdata.homeworkNames[0] === "暂无数据" ? 0 : 2, // 无数据时隐藏线条
          color: '#5470c6' // 线条颜色
        },
        itemStyle: {
          color: '#5470c6', // 数据点颜色
          borderColor: '#fff', // 数据点边框颜色
          borderWidth: 2 // 数据点边框宽度
        },
        emphasis: {
          scale: ecdata.homeworkNames[0] !== "暂无数据", // 无数据时不显示悬停效果
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        }
      }
    ]
  })

  echartsResize(myLineChart);
}

// 箱形图 数据处理
function transformApiData(apiData: any[]) {
  const categories: any[] = []; // x轴类别
  const boxplotData: number[][] = []; // 箱形图数据 [min, Q1, median, Q3, max]
  const scatterData: any[][] = []; // 散点数据（用于显示平均值）

  apiData.forEach(item => {
    // 提取类别名称
    categories.push(item.groupName);

    // 转换为箱形图数据格式: [min, Q1, median, Q3, max]
    const boxData = [
      parseFloat(item.minScore),
      parseFloat(item.q1),
      parseFloat(item.median),
      parseFloat(item.q3),
      parseFloat(item.maxScore)
    ];
    boxplotData.push(boxData);

    // 为平均值创建散点数据
    scatterData.push([
      item.groupName, // x轴位置
      parseFloat(item.avgScore) // y轴位置（平均值）
    ]);
  });

  return { categories, boxplotData, scatterData };
}
// 箱形图
const boxChatRef = ref(null);
let myBoxChart: any = null;
const initBoxChart = async () => {
  const inteData = await dataApi();
  // 数据转换
  const { categories, boxplotData, scatterData } = transformApiData(inteData.rows);

  // 确保DOM元素已存在
  if (!boxChatRef.value) return;
  // 销毁已存在的图表实例
  if (myBoxChart) myBoxChart.dispose();
  // 创建新图表实例
  myBoxChart = echarts.init(boxChatRef.value);

  myBoxChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: function (params: { componentType: string; dataIndex: any; seriesType: string; name: any; }) {
        if (params.componentType === 'series') {
          const data = inteData.rows[params.dataIndex || 0];
          if (params.seriesType === 'boxplot') {
            return `
              <div style="font-weight: bold; margin-bottom: 8px; text-align: center;">${data.groupName}</div>
              <div style="line-height: 1.6; font-size: 13px;">
                <div>最高分: ${data.maxScore}分</div>
                <div>上四分位数: ${data.q3}分</div>
                <div>中位数: ${data.median}分</div>
                <div>平均分: ${data.avgScore}分</div>
                <div>下四分位数: ${data.q1}分</div>
                <div>最低分: ${data.minScore}分</div>
                ${data.iqr ? `<div>四分位距: ${data.iqr}分</div>` : ''}
              </div>
            `;
          } else if (params.seriesType === 'scatter') {
            return `${data.groupName}<br/>平均分: ${data.avgScore}分`;
          }
        }
        return params.name;
      }
    },
    // dataset: [{
    //   // [类别, 最小值, 下四分位数, 中位数, 上四分位数, 最大值]
    //   // ['思源学校', 37, 38, 39, 48.5, 58]
    //   source: boxplotData
    // }],
    xAxis: {
      type: 'category',
      name: '',   // 学校或班级，这里没有
      data: categories,
      axisLabel: {
        interval: 0,
        fontSize: 12,
      }
    },
    yAxis: {
      type: 'value',
      name: '分数',
      min: function (value: { min: number; }) {
        // 动态设置y轴最小值，确保有足够空间
        return Math.max(0, value.min - 5);
      },
      max: function (value: { max: number; }) {
        // 动态设置y轴最大值
        return Math.min(150, value.max + 5);
      },
      interval: 10
    },
    // 关键：调整布局区域，增加高度
    grid: {
      left: '5%',
      right: '10%',
      top: '5%',
      bottom: '10%',
      height: '85%' // 增加图表主体高度
    },
    series: [
      {
        name: '分数分布',
        type: 'boxplot',
        data: boxplotData,
        // 浅蓝色主题
        itemStyle: {
          color: '#87CEEB',
          borderColor: '#4682B4',
          borderWidth: 1.5
        },
        // 中位数线样式
        medianStyle: {
          color: '#FF6347',
          lineStyle: {
            type: 'solid',
            width: 2
          }
        },
        // 调整箱形图宽度
        barWidth: '40%'
      },
      {
        name: '平均分',
        type: 'scatter',
        data: scatterData,
        symbol: 'diamond',
        symbolSize: 8,
        itemStyle: {
          color: '#FF8C00'
        },
        label: {
          show: true,
          position: 'top',
          formatter: '平均: {c}',
          fontSize: 10
        },
        tooltip: {
          trigger: 'item'
        }
      }
    ]
  });

  echartsResize(myBoxChart);
}

// 横向 水平柱状图
const levelChatRef = ref(null);
let myLevelChart: any = null;
const initLevelChart = async () => {
  const inteData = await dataApi();
  // console.log("水平柱状图", inteData)
  // 处理数据
  const xData: any[] = [];
  const yData: any[] = [];
  inteData.rows.forEach((item: { subjectScore: any; subjectName: any; }) => {
    xData.push(item.subjectScore)
    yData.push(item.subjectName)
  });

  // 确保DOM元素已存在
  if (!levelChatRef.value) return;
  // 销毁已存在的图表实例
  if (myLevelChart) myLevelChart.dispose();
  // 创建新图表实例
  myLevelChart = echarts.init(levelChatRef.value);

  myLevelChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: 150,
      interval: 10,
      axisLine: {
        show: true
      },
      axisTick: {
        show: true
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: yData,
      axisLine: {
        show: true
      },
      axisTick: {
        show: true
      }
    },
    series: [
      {
        name: '数值',
        type: 'bar',
        barWidth: '60%',
        data: xData,
        itemStyle: {
          color: '#5470c6'
        },
        label: {
          show: true,
          position: 'right'
        }
      }
    ]
  });

  echartsResize(myLevelChart);
}

// 雷达图
const radarChatRef = ref(null);
let myRadarChart: any = null;
const initRadarChart = async () => {
  const inteData = await dataApi();
  // 数据处理
  const dataExample: { name: any; max: number; }[] = []
  const valueData: { value: number[]; name: any; }[] = []
  const nameData: any[] = []
  inteData.rows.forEach((item: { subjectName: any; subjectScore: number; totalScore: number; }) => {
    dataExample.push({
      name: item.subjectName,
      max: Math.min(item.subjectScore + 10, item.totalScore + 15)
    });
    valueData.push({
      value: [item.subjectScore],
      name: item.subjectName
    });
    nameData.push(item.subjectName)
  });


  // 确保DOM元素已存在
  if (!radarChatRef.value) return;
  // 销毁已存在的图表实例
  if (myRadarChart) myRadarChart.dispose();
  // 创建新图表实例
  myRadarChart = echarts.init(radarChatRef.value);

  myRadarChart.setOption({
    legend: {
      data: nameData,
      top: '4%',   // 修改示例位置
      textStyle: {
        color: '#333',
        fontSize: 14,
        fontWeight: "bold"
      },
      itemWidth: 20,
      itemHeight: 10,
      itemGap: 15
    },
    radar: {
      shape: 'circle',
      // 调整雷达图的中心位置
      center: ['50%', '60%'], // 将中心位置调整向下
      indicator: dataExample, // 底图圆环大小 动态数据
      radius: '60%',
      name: {
        textStyle: {
          color: '#333',
          fontSize: 15,
          fontWeight: "bold",
        },
        // 增加科目名称与雷达图的间距
        padding: [20, 20]
      },
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#ddd'
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(255,255,255,0.5)', 'rgba(200,200,200,0.1)']
        }
      }
    },
    series: [{
      name: "",
      type: 'radar',
      data: valueData,  // 显示数据
    }],
    tooltip: {
      trigger: 'item',
      formatter: function (params: any) {
        const indicator = myRadarChart.getOption().radar[0].indicator;
        const myClass = params.name;
        let html = `${myClass}<br/>`;
        // 遍历每个指标，拼接"指标名: 值"
        indicator.forEach((item: { name: any; }, idx: string | number) => {
          html += `${item.name}: ${params.value[idx]}<br/>`;
        });
        return html;
      },
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#409eff',
      borderWidth: 1,
      textStyle: {
        color: '#333',
        fontSize: 14
      },
      extraCssText: 'box-shadow: 0 2px 8px rgba(0,0,0,0.15); padding: 8px 12px;'
    },
    grid: {
      top: '25%',
      bottom: '1%'
    }
  })

  echartsResize(myRadarChart);
}

// 添加 refresh 刷新方法
const refresh = async () => {
  // console.log("刷新了吗？")
  data.value = {};  // 清除缓存
  dataPromise = null;
  // 根据类型重新初始化
  if (props.type === 'table') {
    tabIns.value?.fetch()
  } else if (props.type === 'bar') {
    await initBarChart();
  } else if (props.type === 'line') {
    await initlineChart();
  } else if (props.type === 'box') {
    await initBoxChart()
  } else if (props.type === 'level') {
    await initLevelChart()
  } else if (props.type === 'radar') {
    await initRadarChart()
  } 
  // ... 其他类型
};

// 暴露方法
defineExpose({ 
  refresh,
  dataApi
});

// props.fields 和 props.type 的监听
watch([() => props.fields, () => props.type], () => {
  // console.log("type++++++++++++++++++++++++++++++++++++++++", props.type)
  if (props.type === "table") {
    nextTick(() => { 
      tabIns.value?.fetch(); 
    });
  } else if (props.type === "bar") {
    nextTick(() => {
      initBarChart();
    });
  } else if (props.type === "line") {
    nextTick(() => {
      initlineChart();
    });
  } else if (props.type === "box") {
    nextTick(() => {
      initBoxChart();
    });
  } else if (props.type === "level") {
    nextTick(() => {
      initLevelChart();
    });
  } else if (props.type === "radar") {
    nextTick(() => {
      initRadarChart();
    });
  }
});

onMounted(() => {
  if (props.type === 'bar' && (props.showDialogType === 0 || props.showDialogType === 1)) {
    nextTick(() => {
      initBarChart();
    });
  } else if (props.type === 'line' && (props.showDialogType === 0 || props.showDialogType === 2)) {
    nextTick(() => {
      initlineChart()
    })
  } else if (props.type === 'bar' && props.showDialogType === 3) {
    nextTick(() => {
      initBarChart();
    });
  } else if (props.type === 'box' && props.showDialogType === 5) {
    nextTick(() => {
      initBoxChart();
    });
  } else if (props.type === 'level' && props.showDialogType === 6) {
    nextTick(() => {
      initLevelChart();
    });
  } else if (props.type === 'radar' && props.showDialogType === 7) {
    nextTick(() => {
      initRadarChart();
    });
  } else if (props.type === 'pie' && props.showDialogType === 8) {
    // console.log("props.showDialogType === 8 走饼状图")
  }
})

onBeforeUnmount(() => {
  if (myBarChart) {
    myBarChart.dispose();
    myBarChart = null;
  }
  if (myLineChart) {
    myLineChart.dispose();
    myLineChart = null;
  }
  if (myBoxChart) {
    myBoxChart.dispose();
    myBoxChart = null;
  }
  if (myLevelChart) {
    myLevelChart.dispose();
    myLevelChart = null;
  }
  if (myRadarChart) {
    myRadarChart.dispose();
    myRadarChart = null;
  }
});
</script>

<style lang="scss" scoped></style>
