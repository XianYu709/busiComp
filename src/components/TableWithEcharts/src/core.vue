<template>
  <div>
    <Table v-if="type === 'table'" />
    <div v-else-if="type === 'bar'" ref="barChartRef" :style="{ height: '250px' }"></div>
    <div v-else-if="type === 'line'" ref="lineChartRef" :style="{ height: '250px' }"></div>
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
    type: "table" | "bar" | "bar1" | "line" | "line1" | "box" | "level" | "radar" | "pie";
    barTypeDefine?: string;
    selectRanking?: boolean;
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

const emit = defineEmits<{
  'update-ranking-options': [options: any[]]
}>()


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

// 处理 排名分段分布 下拉选择框数据
const processRankingData = (row: { data: { segmentResults: any; }[]; }) => {
  // console.log("下拉选择框数据",row)
  const segmentArr = row?.data[0]?.segmentResults
  if (segmentArr.length > 0) {
    return segmentArr.map((item: { segmentName: string; count: number; }, index: number) => ({
      label: "前" + item.segmentName + "名",
      value: item.segmentName,
      key: index
    }))
  } else {
    return []
  }
}

// echarts 柱状图
const barChartRef = ref(null);
let myBarChart: any = null;
const initBarChart = async (sledValue: string) => {
  // console.log("柱状图+++++++方法参数",sledValue)
  const rawData = await dataApi();
  // console.log("图标接口", rawData);
  // console.log("图标接口JSON", JSON.stringify(rawData));

  let rankingOptions: any[];
  if (!sledValue && props.selectRanking && rawData) {
    // console.log("排名分段选择下拉框---------应该显示")
    rankingOptions = processRankingData(rawData);
    emit('update-ranking-options', rankingOptions);
  }

  if (!barChartRef.value) return; // 确保有DOM
  if (myBarChart) myBarChart.dispose(); // 销毁已有图表
  myBarChart = echarts.init(barChartRef.value);

  // 区分bar类型：默认bar和bar1 selectBar
  if (props.barTypeDefine === 'selectBar') {
    // ========== selectBar配置：按排名展示人数 ==========
    let legendName: string[];
    
    if (sledValue) {
      legendName = ["前" + sledValue + "名"]
    } else {
      legendName = ["前" + 3 + "名"]
    }

    const sourceData = [
      ['product', ...legendName],
      ...rawData.data.map((row: { groupName: string; segmentResults: any[]; }) => [
        row?.groupName || "",
        sledValue
        ? row.segmentResults.find(item => 
            item.segmentName === sledValue
          )?.count || 0
        : row.segmentResults[0].count
      ])
    ]

    myBarChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: {
        data: legendName,
        top: 10,
      },
      dataset: {
        source: sourceData
        // [
        //   ['product', '前三名'],
        //   ['学校', 3],
        //   ['班级', 2]
        // ]
      },
      xAxis: {
        type: 'category',
      },
      yAxis: {},
      series: [
        {
          type: 'bar',
          name: legendName.toString(),
          barWidth: '20%', // 调整柱子宽度
        }
      ]
    });
  } else if (props.barTypeDefine === 'bar1') {
    // ========== bar1配置：按班级和等级展示百分比 ==========
    const chartData = rawData.data || [];
    // 1. 获取所有等级名称（以数据中等级最多的为准）
    const allLevels = chartData.reduce((levels: string[], item: any) => {
      item.levelDistributions?.forEach((level: any) => {
        if (!levels.includes(level.levelName)) {
          levels.push(level.levelName);
        }
      });
      return levels;
    }, []).sort(); // 排序确保等级顺序一致（A、B、C、D...）

    // 2. 处理每个班级的等级数据（补全缺失等级，比例默认为0）
    const seriesData = chartData.map((cls: any) => {
      const levelMap = cls.levelDistributions?.reduce((map: Record<string, { ratio: number; count: number }>, level: any) => {
        map[level.levelName] = {
          ratio: level.segmentRatio ? Number(level.segmentRatio) : 0,
          count: level.segmentCount || 0
        };
        return map;
      }, {});

      // 补全所有等级的数据
      return allLevels.map(level => {
        const data = levelMap[level] || { ratio: 0, count: 0 };
        return {
          value: data.ratio,
          count: data.count // 存储人数用于tooltip
        };
      });
    });

    // 3. 班级名称（过滤空名称）
    const classNameList = chartData.map((cls: any) => cls.className || '未命名班级');

    // 4. 设置图表配置
    myBarChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: function (params: any[]) {
          const className = classNameList[params[0].dataIndex];
          let html = `<div style="font-weight: bold;">${className}</div>`;
          params.forEach((param: any) => {
            const levelName = param.seriesName;
            const ratio = param.value;
            const count = param.data.count;
            html += `<div>${levelName}: ${ratio}% (${count}人)</div>`;
          });
          return html;
        },
        // backgroundColor: 'rgba(0, 0, 0, 0.7)',
        // textStyle: { color: '#fff' },
        // borderRadius: 4
      },
      legend: {
        data: allLevels,
        top: 10,
        left: 'center',
        // textStyle: { color: '#333' }
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '10%',
        top: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: classNameList,
        // axisLabel: {
        //   interval: 0,
        //   rotate: -15, // 旋转标签防止重叠
        //   fontSize: 12
        // },
      },
      yAxis: {
        type: 'value',
        name: '比例 (%)',
        max: 100, // y轴最大值固定为100
        min: 0,
        interval: 20, // 刻度间隔20%
        axisLabel: {
          formatter: '{value}%' // 显示百分比符号
        },
      },
      series: allLevels.map((level, index) => {
        return {
          name: level,
          type: 'bar',
          barWidth: '10%', // 调整柱子宽度
          data: seriesData.map((clsData: any[]) => clsData[index]),
          itemStyle: {
            // 为不同等级设置不同颜色（可根据需求调整）
            color: ['#4895ef', '#6fcf97', '#f9c74f', '#f8961e', '#90a4ae'][index % 5]
          }
        };
      })
    });
  } else {
    // ========== 原有bar配置：最高分/最低分/平均分 ==========
    let chartSource = [
      ['product', '最高分', '最低分', '平均分'] // 表头
    ];

    // 如果有数据，添加数据行
    if (rawData?.rows?.length) {
      chartSource = [
        ['product', '最高分', '最低分', '平均分'], // 表头
        ...rawData.rows.map((row: { subjectName: any; groupName: any; maxScore: any; minScore: any; avgScore: any; }) => [
          row?.subjectName || row?.groupName, // x轴类目（学科名）
          row.maxScore, // 最高分
          row.minScore, // 最低分
          row.avgScore // 平均分
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
    });
  }

  echartsResize(myBarChart);
};

// 折线图
const lineChartRef = ref(null);
let myLineChart: any = null;
const initlineChart = async () => {
  const rawData = await dataApi();
  // console.log("折线图接口数据", rawData);

  // 校验DOM和数据
  if (!lineChartRef.value) return;
  // 销毁已有图表实例，避免重复渲染
  if (myLineChart) myLineChart.dispose();
  // 初始化echarts实例
  myLineChart = echarts.init(lineChartRef.value);

  // ========== 核心数据处理 ==========
  const chartData = rawData.data || [];
  if (chartData.length === 0) {
    // 无数据时的兜底配置
    myLineChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: [] },
      xAxis: { type: 'category', data: ['暂无数据'] },
      yAxis: { type: 'value', name: '人数' },
      series: [{ type: 'line', data: [0], name: '暂无数据' }]
    });
    echartsResize(myLineChart);
    return;
  }

  // 1. 提取所有分段名称（x轴数据）- 以第一个分组的分段为准，确保所有分组分段一致
  const xAxisData = chartData[0].segmentResults?.map((item: any) => item.segmentName) || [];
  
  // 2. 处理分组数据（适配学校/班级维度，处理空groupName）
  const seriesList = chartData.map((groupItem: any, index: number) => {
    // 处理空分组名称：班级维度空name显示为"1班"，学校维度保留原名称
    let groupName = groupItem.groupName || '';
    if (groupName === '') {
      // 本校班级维度空名称默认显示为"1班"（可根据你的实际逻辑调整）
      groupName = '1班';
    } else if (groupName === 'summary') {
      // 特殊标识替换（如果有需要）
      groupName = '年级'; // 班级维度summary对应年级，学校维度可对应"考试全体"/"联考全体"
    }

    // 提取当前分组的人数（y轴值）和比例（用于tooltip）
    const countData = groupItem.segmentResults?.map((item: any) => item.count || 0) || [];
    const ratioData = groupItem.segmentResults?.map((item: any) => item.ratio || '0.00') || [];

    return {
      name: groupName, // 图例名称
      type: 'line', // 折线图类型
      symbol: 'circle', // 拐点为圆形（匹配示例样式）
      symbolSize: 8, // 拐点大小
      smooth: true, // 平滑折线（匹配示例的渐变折线）
      data: countData.map((count: number, idx: number) => ({
        value: count,
        ratio: ratioData[idx] // 绑定比例数据到每个点，用于tooltip
      })),
      lineStyle: {
        width: 2 // 折线宽度
      },
      itemStyle: {
        // 不同分组用不同颜色（匹配示例的浅蓝/浅绿）
        color: index === 0 ? '#4895ef' : '#6fcf97' 
      }
    };
  });

  // 3. 提取图例数据（处理后的分组名称）
  const legendData = seriesList.map((item: any) => item.name);

  // ========== ECharts配置项 ==========
  const option = {
    // 提示框配置（核心：匹配示例的tooltip样式）
    tooltip: {
      trigger: 'axis', // 按坐标轴触发（鼠标移到分段区域显示所有分组数据）
      axisPointer: {
        type: 'shadow', // 阴影指示器（匹配示例）
        z: 1
      },
      backgroundColor: 'rgba(0, 0, 0, 0.7)', // 深色背景
      textStyle: { color: '#fff' }, // 白色文字
      borderRadius: 4, // 圆角
      padding: 8, // 内边距
      // 自定义tooltip内容
      formatter: function (params: any[]) {
        if (params.length === 0) return '';
        // 第一步：获取当前分段名称（如[50,90]）
        const segmentName = params[0].axisValue;
        // 第二步：拼接tooltip内容
        let tooltipHtml = `<div style="font-weight: bold;">${segmentName}</div>`;
        // 遍历每个分组（如联考全体/本校、年级/1班）
        params.forEach((param: any) => {
          const groupName = param.seriesName;
          const count = param.value; // 人数
          const ratio = param.data.ratio; // 比例
          // 拼接每行：分组名 + 人数 + 比例（匹配示例样式）
          tooltipHtml += `<div>
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${param.color};margin-right:4px;"></span>
            ${groupName}：${count}人，比例${ratio}%
          </div>`;
        });
        return tooltipHtml;
      }
    },
    // 图例配置
    legend: {
      data: legendData, // 处理后的分组名称（如济南临时测试/考试全体、年级/1班）
      top: 10, // 图例位置
      left: 'center', // 水平居中
      textStyle: { color: '#333', fontSize: 12 } // 图例文字样式
    },
    // 网格配置（调整边距，避免内容溢出）
    grid: {
      left: '5%',
      right: '5%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    // X轴配置
    xAxis: {
      type: 'category',
      data: xAxisData, // 分段名称（如[0,50)、[50,90]）
      axisLabel: {
        fontSize: 12,
        color: '#333'
      },
      axisLine: { lineStyle: { color: '#ccc' } }, // 轴线样式
      axisTick: { alignWithLabel: true } // 刻度与标签对齐
    },
    // Y轴配置
    yAxis: {
      type: 'value',
      name: '人数', // Y轴名称（匹配示例）
      nameTextStyle: { color: '#333', fontSize: 12 },
      min: 0, // Y轴最小值为0（人数不能为负）
      axisLabel: {
        fontSize: 12,
        color: '#333'
      },
      splitLine: { lineStyle: { color: '#eee' } }, // 网格线样式
      axisLine: { lineStyle: { color: '#ccc' } }
    },
    // 系列数据（折线图）
    series: seriesList
  };

  // 设置配置项并适配窗口大小
  myLineChart.setOption(option);
  echartsResize(myLineChart);
};

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
    yData.push(item?.subjectName)
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
  // console.log("雷达图",inteData)
  // 数据处理
  const dataExample: { name: any; max: number; }[] = []
  const valueData: { value: number[]; name: any; }[] = []
  const nameData: any[] = []
  inteData.rows.forEach((item: { subjectName: string; subjectScore: number; totalScore: number; }) => {
    dataExample.push({
      name: item?.subjectName || "",
      max: Math.min(item.subjectScore + 10, item.totalScore + 15)
    });
    valueData.push({
      value: [item.subjectScore],
      name: item?.subjectName || ""
    });
    nameData.push(item?.subjectName || "")
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
    await initBarChart("");
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
  dataApi,
  initBarChart
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
      initBarChart("");
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
      initBarChart("");
    });
  } else if (props.type === 'line' && (props.showDialogType === 0 || props.showDialogType === 2)) {
    nextTick(() => {
      initlineChart()
    })
  } else if (props.type === 'bar' && props.showDialogType === 3) {
    nextTick(() => {
      initBarChart("");
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
