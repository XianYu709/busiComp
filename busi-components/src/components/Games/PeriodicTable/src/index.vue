<template>
  <div class="panel">
    <div class="title">化学元素周期表探索</div>
    <div class="subtitle">点击分类按钮，探索不同类型的化学元素</div>

    <!-- 分类筛选区域 -->
    <div class="filter-section">
      <!-- 元素类型分类 -->
      <div class="filter-group">
        <h3 class="filter-label">元素分类：</h3>
        <div class="filter-buttons">
          <button
            v-for="type in typeCategories"
            :key="type.key"
            class="category-btn"
            :class="{
              active: activeTypeFilter === type.key,
              [`bg-${type.key}`]: activeTypeFilter === type.key,
            }"
            @click="handleTypeFilter(type.key)">
            {{ type.label }}
          </button>
        </div>
      </div>

      <!-- 状态分类 -->
      <div class="filter-group">
        <h3 class="filter-label">状态分类：</h3>
        <div class="filter-buttons">
          <button
            v-for="state in stateCategories"
            :key="state.key"
            class="category-btn"
            :class="{
              active: activeStateFilter === state.key,
              [`bg-${state.key}`]: activeStateFilter === state.key,
            }"
            @click="handleStateFilter(state.key)">
            {{ state.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 元素信息展示区 -->
    <div v-if="selectedElement" class="element-info">
      <h3 class="info-title">{{ selectedElement.name }} ({{ selectedElement.symbol }})</h3>
      <div class="info-grid">
        <div>
          <p>
            <span class="info-label">原子序数：</span>
            <span>{{ selectedElement.atomicNumber }}</span>
          </p>
          <p>
            <span class="info-label">元素符号：</span>
            <span>{{ selectedElement.symbol }}</span>
          </p>
          <p>
            <span class="info-label">元素类型：</span>
            <span>{{ getTypeLabel(selectedElement.type) }}</span>
          </p>
        </div>
        <div>
          <p>
            <span class="info-label">常温状态：</span>
            <span>{{ getStateLabel(selectedElement.state) }}</span>
          </p>
          <p>
            <span class="info-label">周期：</span>
            <span>{{ selectedElement.period }}</span>
          </p>
          <p>
            <span class="info-label">族：</span>
            <span>{{ selectedElement.group }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- 周期表容器 -->
    <div class="table-container">
      <div class="periodic-table">
        <!-- 表头 -->
        <div class="table-row">
          <div class="period-label"></div>
          <div v-for="group in 18" :key="group" class="group-label">{{ group }}</div>
        </div>

        <!-- 主表行 -->
        <div v-for="period in 7" :key="period" class="table-row">
          <div class="period-label">{{ period }}</div>
          <div v-for="group in 18" :key="`${period}-${group}`" class="element-cell-wrapper">
            <div
              v-if="getElement(period, group)"
              class="element-cell"
              :class="getElementClasses(getElement(period, group))"
              @click="handleElementClick(getElement(period, group))">
              <span class="atomic-number">{{ getElement(period, group)?.atomicNumber }}</span>
              <span class="symbol">{{ getElement(period, group)?.symbol }}</span>
              <span class="name">{{ getElement(period, group)?.name }}</span>
            </div>
            <div v-else class="element-cell empty"></div>
          </div>
        </div>

        <!-- 镧系元素 -->
        <div class="lanthanide-section">
          <div class="table-row">
            <div class="period-label"></div>
            <div class="section-header">镧系元素</div>
          </div>
          <div class="table-row">
            <div class="period-label"></div>
            <div
              v-for="(element, index) in lanthanides"
              :key="`lanthanide-${index}`"
              class="element-cell-wrapper">
              <div
                v-if="element"
                class="element-cell"
                :class="getElementClasses(element)"
                @click="handleElementClick(element)">
                <span class="atomic-number">{{ element.atomicNumber }}</span>
                <span class="symbol">{{ element.symbol }}</span>
                <span class="name">{{ element.name }}</span>
              </div>
              <div v-else class="element-cell empty"></div>
            </div>
          </div>
        </div>

        <!-- 锕系元素 -->
        <div class="actinide-section">
          <div class="table-row">
            <div class="period-label"></div>
            <div class="section-header">锕系元素</div>
          </div>
          <div class="table-row">
            <div class="period-label"></div>
            <div
              v-for="(element, index) in actinides"
              :key="`actinide-${index}`"
              class="element-cell-wrapper">
              <div
                v-if="element"
                class="element-cell"
                :class="getElementClasses(element)"
                @click="handleElementClick(element)">
                <span class="atomic-number">{{ element.atomicNumber }}</span>
                <span class="symbol">{{ element.symbol }}</span>
                <span class="name">{{ element.name }}</span>
              </div>
              <div v-else class="element-cell empty"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图例说明 -->
    <div class="legend-section">
      <h3 class="legend-title">图例说明</h3>
      <div class="legend-grid">
        <div v-for="type in typeCategories" :key="`legend-${type.key}`" class="legend-item">
          <div class="legend-color" :class="`bg-${type.key}`"></div>
          <span>{{ type.label }}</span>
        </div>
        <div v-for="state in stateCategories" :key="`legend-${state.key}`" class="legend-item">
          <div class="legend-color" :class="`bg-${state.key}`"></div>
          <span>{{ state.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

// 元素接口定义
interface Element {
  atomicNumber: number;
  symbol: string;
  name: string;
  type: string;
  state: string;
  period: number;
  group: number;
}

// 完整的元素周期表数据
const elements: Element[] = [
  // 第1周期
  { atomicNumber: 1, symbol: "H", name: "氢", type: "nonmetal", state: "gas", period: 1, group: 1 },
  { atomicNumber: 2, symbol: "He", name: "氦", type: "noble", state: "gas", period: 1, group: 18 },

  // 第2周期
  {
    atomicNumber: 3,
    symbol: "Li",
    name: "锂",
    type: "alkali",
    state: "solid",
    period: 2,
    group: 1,
  },
  {
    atomicNumber: 4,
    symbol: "Be",
    name: "铍",
    type: "alkaline",
    state: "solid",
    period: 2,
    group: 2,
  },
  {
    atomicNumber: 5,
    symbol: "B",
    name: "硼",
    type: "metalloid",
    state: "solid",
    period: 2,
    group: 13,
  },
  {
    atomicNumber: 6,
    symbol: "C",
    name: "碳",
    type: "nonmetal",
    state: "solid",
    period: 2,
    group: 14,
  },
  {
    atomicNumber: 7,
    symbol: "N",
    name: "氮",
    type: "nonmetal",
    state: "gas",
    period: 2,
    group: 15,
  },
  {
    atomicNumber: 8,
    symbol: "O",
    name: "氧",
    type: "nonmetal",
    state: "gas",
    period: 2,
    group: 16,
  },
  { atomicNumber: 9, symbol: "F", name: "氟", type: "halogen", state: "gas", period: 2, group: 17 },
  { atomicNumber: 10, symbol: "Ne", name: "氖", type: "noble", state: "gas", period: 2, group: 18 },

  // 第3周期
  {
    atomicNumber: 11,
    symbol: "Na",
    name: "钠",
    type: "alkali",
    state: "solid",
    period: 3,
    group: 1,
  },
  {
    atomicNumber: 12,
    symbol: "Mg",
    name: "镁",
    type: "alkaline",
    state: "solid",
    period: 3,
    group: 2,
  },
  {
    atomicNumber: 13,
    symbol: "Al",
    name: "铝",
    type: "posttransition",
    state: "solid",
    period: 3,
    group: 13,
  },
  {
    atomicNumber: 14,
    symbol: "Si",
    name: "硅",
    type: "metalloid",
    state: "solid",
    period: 3,
    group: 14,
  },
  {
    atomicNumber: 15,
    symbol: "P",
    name: "磷",
    type: "nonmetal",
    state: "solid",
    period: 3,
    group: 15,
  },
  {
    atomicNumber: 16,
    symbol: "S",
    name: "硫",
    type: "nonmetal",
    state: "solid",
    period: 3,
    group: 16,
  },
  {
    atomicNumber: 17,
    symbol: "Cl",
    name: "氯",
    type: "halogen",
    state: "gas",
    period: 3,
    group: 17,
  },
  { atomicNumber: 18, symbol: "Ar", name: "氩", type: "noble", state: "gas", period: 3, group: 18 },

  // 第4周期
  {
    atomicNumber: 19,
    symbol: "K",
    name: "钾",
    type: "alkali",
    state: "solid",
    period: 4,
    group: 1,
  },
  {
    atomicNumber: 20,
    symbol: "Ca",
    name: "钙",
    type: "alkaline",
    state: "solid",
    period: 4,
    group: 2,
  },
  {
    atomicNumber: 21,
    symbol: "Sc",
    name: "钪",
    type: "transition",
    state: "solid",
    period: 4,
    group: 3,
  },
  {
    atomicNumber: 22,
    symbol: "Ti",
    name: "钛",
    type: "transition",
    state: "solid",
    period: 4,
    group: 4,
  },
  {
    atomicNumber: 23,
    symbol: "V",
    name: "钒",
    type: "transition",
    state: "solid",
    period: 4,
    group: 5,
  },
  {
    atomicNumber: 24,
    symbol: "Cr",
    name: "铬",
    type: "transition",
    state: "solid",
    period: 4,
    group: 6,
  },
  {
    atomicNumber: 25,
    symbol: "Mn",
    name: "锰",
    type: "transition",
    state: "solid",
    period: 4,
    group: 7,
  },
  {
    atomicNumber: 26,
    symbol: "Fe",
    name: "铁",
    type: "transition",
    state: "solid",
    period: 4,
    group: 8,
  },
  {
    atomicNumber: 27,
    symbol: "Co",
    name: "钴",
    type: "transition",
    state: "solid",
    period: 4,
    group: 9,
  },
  {
    atomicNumber: 28,
    symbol: "Ni",
    name: "镍",
    type: "transition",
    state: "solid",
    period: 4,
    group: 10,
  },
  {
    atomicNumber: 29,
    symbol: "Cu",
    name: "铜",
    type: "transition",
    state: "solid",
    period: 4,
    group: 11,
  },
  {
    atomicNumber: 30,
    symbol: "Zn",
    name: "锌",
    type: "transition",
    state: "solid",
    period: 4,
    group: 12,
  },
  {
    atomicNumber: 31,
    symbol: "Ga",
    name: "镓",
    type: "posttransition",
    state: "solid",
    period: 4,
    group: 13,
  },
  {
    atomicNumber: 32,
    symbol: "Ge",
    name: "锗",
    type: "metalloid",
    state: "solid",
    period: 4,
    group: 14,
  },
  {
    atomicNumber: 33,
    symbol: "As",
    name: "砷",
    type: "metalloid",
    state: "solid",
    period: 4,
    group: 15,
  },
  {
    atomicNumber: 34,
    symbol: "Se",
    name: "硒",
    type: "nonmetal",
    state: "solid",
    period: 4,
    group: 16,
  },
  {
    atomicNumber: 35,
    symbol: "Br",
    name: "溴",
    type: "halogen",
    state: "liquid",
    period: 4,
    group: 17,
  },
  { atomicNumber: 36, symbol: "Kr", name: "氪", type: "noble", state: "gas", period: 4, group: 18 },

  // 第5周期
  {
    atomicNumber: 37,
    symbol: "Rb",
    name: "铷",
    type: "alkali",
    state: "solid",
    period: 5,
    group: 1,
  },
  {
    atomicNumber: 38,
    symbol: "Sr",
    name: "锶",
    type: "alkaline",
    state: "solid",
    period: 5,
    group: 2,
  },
  {
    atomicNumber: 39,
    symbol: "Y",
    name: "钇",
    type: "transition",
    state: "solid",
    period: 5,
    group: 3,
  },
  {
    atomicNumber: 40,
    symbol: "Zr",
    name: "锆",
    type: "transition",
    state: "solid",
    period: 5,
    group: 4,
  },
  {
    atomicNumber: 41,
    symbol: "Nb",
    name: "铌",
    type: "transition",
    state: "solid",
    period: 5,
    group: 5,
  },
  {
    atomicNumber: 42,
    symbol: "Mo",
    name: "钼",
    type: "transition",
    state: "solid",
    period: 5,
    group: 6,
  },
  {
    atomicNumber: 43,
    symbol: "Tc",
    name: "锝",
    type: "transition",
    state: "solid",
    period: 5,
    group: 7,
  },
  {
    atomicNumber: 44,
    symbol: "Ru",
    name: "钌",
    type: "transition",
    state: "solid",
    period: 5,
    group: 8,
  },
  {
    atomicNumber: 45,
    symbol: "Rh",
    name: "铑",
    type: "transition",
    state: "solid",
    period: 5,
    group: 9,
  },
  {
    atomicNumber: 46,
    symbol: "Pd",
    name: "钯",
    type: "transition",
    state: "solid",
    period: 5,
    group: 10,
  },
  {
    atomicNumber: 47,
    symbol: "Ag",
    name: "银",
    type: "transition",
    state: "solid",
    period: 5,
    group: 11,
  },
  {
    atomicNumber: 48,
    symbol: "Cd",
    name: "镉",
    type: "transition",
    state: "solid",
    period: 5,
    group: 12,
  },
  {
    atomicNumber: 49,
    symbol: "In",
    name: "铟",
    type: "posttransition",
    state: "solid",
    period: 5,
    group: 13,
  },
  {
    atomicNumber: 50,
    symbol: "Sn",
    name: "锡",
    type: "posttransition",
    state: "solid",
    period: 5,
    group: 14,
  },
  {
    atomicNumber: 51,
    symbol: "Sb",
    name: "锑",
    type: "metalloid",
    state: "solid",
    period: 5,
    group: 15,
  },
  {
    atomicNumber: 52,
    symbol: "Te",
    name: "碲",
    type: "metalloid",
    state: "solid",
    period: 5,
    group: 16,
  },
  {
    atomicNumber: 53,
    symbol: "I",
    name: "碘",
    type: "halogen",
    state: "solid",
    period: 5,
    group: 17,
  },
  { atomicNumber: 54, symbol: "Xe", name: "氙", type: "noble", state: "gas", period: 5, group: 18 },

  // 第6周期
  {
    atomicNumber: 55,
    symbol: "Cs",
    name: "铯",
    type: "alkali",
    state: "solid",
    period: 6,
    group: 1,
  },
  {
    atomicNumber: 56,
    symbol: "Ba",
    name: "钡",
    type: "alkaline",
    state: "solid",
    period: 6,
    group: 2,
  },
  {
    atomicNumber: 57,
    symbol: "La",
    name: "镧",
    type: "lanthanide",
    state: "solid",
    period: 6,
    group: 3,
  },
  {
    atomicNumber: 72,
    symbol: "Hf",
    name: "铪",
    type: "transition",
    state: "solid",
    period: 6,
    group: 4,
  },
  {
    atomicNumber: 73,
    symbol: "Ta",
    name: "钽",
    type: "transition",
    state: "solid",
    period: 6,
    group: 5,
  },
  {
    atomicNumber: 74,
    symbol: "W",
    name: "钨",
    type: "transition",
    state: "solid",
    period: 6,
    group: 6,
  },
  {
    atomicNumber: 75,
    symbol: "Re",
    name: "铼",
    type: "transition",
    state: "solid",
    period: 6,
    group: 7,
  },
  {
    atomicNumber: 76,
    symbol: "Os",
    name: "锇",
    type: "transition",
    state: "solid",
    period: 6,
    group: 8,
  },
  {
    atomicNumber: 77,
    symbol: "Ir",
    name: "铱",
    type: "transition",
    state: "solid",
    period: 6,
    group: 9,
  },
  {
    atomicNumber: 78,
    symbol: "Pt",
    name: "铂",
    type: "transition",
    state: "solid",
    period: 6,
    group: 10,
  },
  {
    atomicNumber: 79,
    symbol: "Au",
    name: "金",
    type: "transition",
    state: "solid",
    period: 6,
    group: 11,
  },
  {
    atomicNumber: 80,
    symbol: "Hg",
    name: "汞",
    type: "transition",
    state: "liquid",
    period: 6,
    group: 12,
  },
  {
    atomicNumber: 81,
    symbol: "Tl",
    name: "铊",
    type: "posttransition",
    state: "solid",
    period: 6,
    group: 13,
  },
  {
    atomicNumber: 82,
    symbol: "Pb",
    name: "铅",
    type: "posttransition",
    state: "solid",
    period: 6,
    group: 14,
  },
  {
    atomicNumber: 83,
    symbol: "Bi",
    name: "铋",
    type: "posttransition",
    state: "solid",
    period: 6,
    group: 15,
  },
  {
    atomicNumber: 84,
    symbol: "Po",
    name: "钋",
    type: "metalloid",
    state: "solid",
    period: 6,
    group: 16,
  },
  {
    atomicNumber: 85,
    symbol: "At",
    name: "砹",
    type: "halogen",
    state: "solid",
    period: 6,
    group: 17,
  },
  { atomicNumber: 86, symbol: "Rn", name: "氡", type: "noble", state: "gas", period: 6, group: 18 },

  // 第7周期
  {
    atomicNumber: 87,
    symbol: "Fr",
    name: "钫",
    type: "alkali",
    state: "solid",
    period: 7,
    group: 1,
  },
  {
    atomicNumber: 88,
    symbol: "Ra",
    name: "镭",
    type: "alkaline",
    state: "solid",
    period: 7,
    group: 2,
  },
  {
    atomicNumber: 89,
    symbol: "Ac",
    name: "锕",
    type: "actinide",
    state: "solid",
    period: 7,
    group: 3,
  },
  {
    atomicNumber: 104,
    symbol: "Rf",
    name: "𬬻",
    type: "transition",
    state: "unknown",
    period: 7,
    group: 4,
  },
  {
    atomicNumber: 105,
    symbol: "Db",
    name: "𬭊",
    type: "transition",
    state: "unknown",
    period: 7,
    group: 5,
  },
  {
    atomicNumber: 106,
    symbol: "Sg",
    name: "𬭳",
    type: "transition",
    state: "unknown",
    period: 7,
    group: 6,
  },
  {
    atomicNumber: 107,
    symbol: "Bh",
    name: "𬭛",
    type: "transition",
    state: "unknown",
    period: 7,
    group: 7,
  },
  {
    atomicNumber: 108,
    symbol: "Hs",
    name: "𬭶",
    type: "transition",
    state: "unknown",
    period: 7,
    group: 8,
  },
  {
    atomicNumber: 109,
    symbol: "Mt",
    name: "鿏",
    type: "transition",
    state: "unknown",
    period: 7,
    group: 9,
  },
  {
    atomicNumber: 110,
    symbol: "Ds",
    name: "𫟼",
    type: "transition",
    state: "unknown",
    period: 7,
    group: 10,
  },
  {
    atomicNumber: 111,
    symbol: "Rg",
    name: "𬬭",
    type: "transition",
    state: "unknown",
    period: 7,
    group: 11,
  },
  {
    atomicNumber: 112,
    symbol: "Cn",
    name: "鿔",
    type: "transition",
    state: "unknown",
    period: 7,
    group: 12,
  },
  {
    atomicNumber: 113,
    symbol: "Nh",
    name: "鿭",
    type: "posttransition",
    state: "unknown",
    period: 7,
    group: 13,
  },
  {
    atomicNumber: 114,
    symbol: "Fl",
    name: "𫓧",
    type: "posttransition",
    state: "unknown",
    period: 7,
    group: 14,
  },
  {
    atomicNumber: 115,
    symbol: "Mc",
    name: "镆",
    type: "posttransition",
    state: "unknown",
    period: 7,
    group: 15,
  },
  {
    atomicNumber: 116,
    symbol: "Lv",
    name: "𫟷",
    type: "posttransition",
    state: "unknown",
    period: 7,
    group: 16,
  },
  {
    atomicNumber: 117,
    symbol: "Ts",
    name: "鿬",
    type: "halogen",
    state: "unknown",
    period: 7,
    group: 17,
  },
  {
    atomicNumber: 118,
    symbol: "Og",
    name: "鿫",
    type: "noble",
    state: "unknown",
    period: 7,
    group: 18,
  },

  // 镧系元素 (57-71)
  {
    atomicNumber: 58,
    symbol: "Ce",
    name: "铈",
    type: "lanthanide",
    state: "solid",
    period: 6,
    group: 3,
  },
  {
    atomicNumber: 59,
    symbol: "Pr",
    name: "镨",
    type: "lanthanide",
    state: "solid",
    period: 6,
    group: 3,
  },
  {
    atomicNumber: 60,
    symbol: "Nd",
    name: "钕",
    type: "lanthanide",
    state: "solid",
    period: 6,
    group: 3,
  },
  {
    atomicNumber: 61,
    symbol: "Pm",
    name: "钷",
    type: "lanthanide",
    state: "solid",
    period: 6,
    group: 3,
  },
  {
    atomicNumber: 62,
    symbol: "Sm",
    name: "钐",
    type: "lanthanide",
    state: "solid",
    period: 6,
    group: 3,
  },
  {
    atomicNumber: 63,
    symbol: "Eu",
    name: "铕",
    type: "lanthanide",
    state: "solid",
    period: 6,
    group: 3,
  },
  {
    atomicNumber: 64,
    symbol: "Gd",
    name: "钆",
    type: "lanthanide",
    state: "solid",
    period: 6,
    group: 3,
  },
  {
    atomicNumber: 65,
    symbol: "Tb",
    name: "铽",
    type: "lanthanide",
    state: "solid",
    period: 6,
    group: 3,
  },
  {
    atomicNumber: 66,
    symbol: "Dy",
    name: "镝",
    type: "lanthanide",
    state: "solid",
    period: 6,
    group: 3,
  },
  {
    atomicNumber: 67,
    symbol: "Ho",
    name: "钬",
    type: "lanthanide",
    state: "solid",
    period: 6,
    group: 3,
  },
  {
    atomicNumber: 68,
    symbol: "Er",
    name: "铒",
    type: "lanthanide",
    state: "solid",
    period: 6,
    group: 3,
  },
  {
    atomicNumber: 69,
    symbol: "Tm",
    name: "铥",
    type: "lanthanide",
    state: "solid",
    period: 6,
    group: 3,
  },
  {
    atomicNumber: 70,
    symbol: "Yb",
    name: "镱",
    type: "lanthanide",
    state: "solid",
    period: 6,
    group: 3,
  },
  {
    atomicNumber: 71,
    symbol: "Lu",
    name: "镥",
    type: "lanthanide",
    state: "solid",
    period: 6,
    group: 3,
  },

  // 锕系元素 (89-103)
  {
    atomicNumber: 90,
    symbol: "Th",
    name: "钍",
    type: "actinide",
    state: "solid",
    period: 7,
    group: 3,
  },
  {
    atomicNumber: 91,
    symbol: "Pa",
    name: "镤",
    type: "actinide",
    state: "solid",
    period: 7,
    group: 3,
  },
  {
    atomicNumber: 92,
    symbol: "U",
    name: "铀",
    type: "actinide",
    state: "solid",
    period: 7,
    group: 3,
  },
  {
    atomicNumber: 93,
    symbol: "Np",
    name: "镎",
    type: "actinide",
    state: "solid",
    period: 7,
    group: 3,
  },
  {
    atomicNumber: 94,
    symbol: "Pu",
    name: "钚",
    type: "actinide",
    state: "solid",
    period: 7,
    group: 3,
  },
  {
    atomicNumber: 95,
    symbol: "Am",
    name: "镅",
    type: "actinide",
    state: "solid",
    period: 7,
    group: 3,
  },
  {
    atomicNumber: 96,
    symbol: "Cm",
    name: "锔",
    type: "actinide",
    state: "solid",
    period: 7,
    group: 3,
  },
  {
    atomicNumber: 97,
    symbol: "Bk",
    name: "锫",
    type: "actinide",
    state: "solid",
    period: 7,
    group: 3,
  },
  {
    atomicNumber: 98,
    symbol: "Cf",
    name: "锎",
    type: "actinide",
    state: "solid",
    period: 7,
    group: 3,
  },
  {
    atomicNumber: 99,
    symbol: "Es",
    name: "锿",
    type: "actinide",
    state: "solid",
    period: 7,
    group: 3,
  },
  {
    atomicNumber: 100,
    symbol: "Fm",
    name: "镄",
    type: "actinide",
    state: "solid",
    period: 7,
    group: 3,
  },
  {
    atomicNumber: 101,
    symbol: "Md",
    name: "钔",
    type: "actinide",
    state: "solid",
    period: 7,
    group: 3,
  },
  {
    atomicNumber: 102,
    symbol: "No",
    name: "锘",
    type: "actinide",
    state: "solid",
    period: 7,
    group: 3,
  },
  {
    atomicNumber: 103,
    symbol: "Lr",
    name: "铹",
    type: "actinide",
    state: "solid",
    period: 7,
    group: 3,
  },
];

const typeCategories = [
  { key: "nonmetal", label: "非金属" },
  { key: "noble", label: "稀有气体" },
  { key: "alkali", label: "碱金属" },
  { key: "alkaline", label: "碱土金属" },
  { key: "metalloid", label: "准金属" },
  { key: "halogen", label: "卤素" },
  { key: "posttransition", label: "弱金属" },
  { key: "transition", label: "过渡元素" },
  { key: "lanthanide", label: "镧系元素" },
  { key: "actinide", label: "锕系元素" },
  { key: "clear", label: "清除筛选" },
];

const stateCategories = [
  { key: "gas", label: "气体" },
  { key: "solid", label: "固体" },
  { key: "liquid", label: "液态" },
  { key: "unknown", label: "未知状态" },
  { key: "clear", label: "清除筛选" },
];

const activeTypeFilter = ref<string | null>(null);
const activeStateFilter = ref<string | null>(null);
const selectedElement = ref<Element | null>(null);

// 获取指定周期和族的元素
const getElement = (period: number, group: number): Element | null => {
  return elements.find(el => el.period === period && el.group === group) || null;
};

// 获取元素样式类
const getElementClasses = (element: Element | null) => {
  if (!element) return "";
  const classes: string[] = [];
  classes.push(`bg-${element.type}`);
  if (activeStateFilter.value && element.state === activeStateFilter.value) {
    classes.push(`bg-${element.state}`);
  }
  if (activeTypeFilter.value && element.type !== activeTypeFilter.value) {
    classes.push("opacity-30");
  } else if (activeStateFilter.value && element.state !== activeStateFilter.value) {
    classes.push("opacity-30");
  } else {
    classes.push("opacity-100");
  }
  return classes.join(" ");
};

// 镧系元素（57-71）
const lanthanides = computed(() => {
  const lanthanideElements = elements.filter(
    el => el.type === "lanthanide" && el.atomicNumber >= 57 && el.atomicNumber <= 71,
  );
  const result: (Element | null)[] = new Array(15).fill(null);
  lanthanideElements.forEach(el => {
    const index = el.atomicNumber - 57;
    result[index] = el;
  });
  return result;
});

// 锕系元素（89-103）
const actinides = computed(() => {
  const actinideElements = elements.filter(
    el => el.type === "actinide" && el.atomicNumber >= 89 && el.atomicNumber <= 103,
  );
  const result: (Element | null)[] = new Array(15).fill(null);
  actinideElements.forEach(el => {
    const index = el.atomicNumber - 89;
    result[index] = el;
  });
  return result;
});

// 处理类型筛选
const handleTypeFilter = (type: string) => {
  if (type === "clear") {
    activeTypeFilter.value = null;
  } else {
    activeTypeFilter.value = activeTypeFilter.value === type ? null : type;
  }
};

// 处理状态筛选
const handleStateFilter = (state: string) => {
  if (state === "clear") {
    activeStateFilter.value = null;
  } else {
    activeStateFilter.value = activeStateFilter.value === state ? null : state;
  }
};

// 处理元素点击
const handleElementClick = (element: Element | null) => {
  if (element) {
    selectedElement.value = element;
  }
};

// 获取类型标签
const getTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    nonmetal: "非金属",
    noble: "稀有气体",
    alkali: "碱金属",
    alkaline: "碱土金属",
    metalloid: "准金属",
    halogen: "卤素",
    posttransition: "弱金属",
    transition: "过渡元素",
    lanthanide: "镧系元素",
    actinide: "锕系元素",
  };
  return typeMap[type] || type;
};

// 获取状态标签
const getStateLabel = (state: string): string => {
  const stateMap: Record<string, string> = {
    gas: "气体",
    solid: "固体",
    liquid: "液态",
    unknown: "未知状态",
  };
  return stateMap[state] || state;
};
</script>

<style scoped>
.panel {
  width: 100%;
  margin: 0 auto;
  background: #f9fafb;
  padding: 24px;
  height: 100%;
}

.title {
  text-align: center;
  font-weight: 700;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #165dff;
  margin-bottom: 8px;
}

.subtitle {
  text-align: center;
  color: #64748b;
  margin-bottom: 24px;
}

.filter-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.filter-group {
  margin-bottom: 16px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-label {
  color: #374151;
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 14px;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #d1d5db;
  background: #f3f4f6;
  color: #374151;
}

.category-btn:hover {
  background: #e5e7eb;
}

.category-btn.active {
  font-weight: 500;
}

.element-info {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.info-title {
  font-size: 18px;
  font-weight: 700;
  color: #165dff;
  margin-bottom: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-label {
  color: #64748b;
  margin-right: 8px;
}

.table-container {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.periodic-table {
  min-width: 1200px;
}

.table-row {
  display: flex;
}

.period-label {
  width: 32px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #64748b;
  flex-shrink: 0;
}

.group-label {
  width: 80px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #64748b;
  flex-shrink: 0;
}

.element-cell-wrapper {
  width: 80px;
  height: 64px;
  flex-shrink: 0;
}

.element-cell {
  width: 100%;
  height: 100%;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
  font-weight: 500;
  position: relative;
}

.element-cell:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.element-cell.empty {
  background: #f9fafb;
  border-color: #e5e7eb;
  cursor: default;
}

.element-cell.empty:hover {
  transform: none;
  box-shadow: none;
}

.atomic-number {
  position: absolute;
  top: 2px;
  left: 4px;
  font-size: 10px;
  font-weight: 600;
}

.symbol {
  font-size: 14px;
  font-weight: 700;
  margin: 2px 0;
}

.name {
  font-size: 10px;
  display: none;
}

@media (min-width: 768px) {
  .name {
    display: block;
  }
}

/* 元素类型颜色 */
.bg-nonmetal {
  background-color: #a8e6cf;
}

.bg-noble {
  background-color: #dcedc1;
}

.bg-alkali {
  background-color: #ffaaa5;
}

.bg-alkaline {
  background-color: #ffd3b6;
}

.bg-metalloid {
  background-color: #ffffd2;
}

.bg-halogen {
  background-color: #bcedc1;
}

.bg-posttransition {
  background-color: #ffaaa5;
}

.bg-transition {
  background-color: #ffaaa5;
}

.bg-lanthanide {
  background-color: #ffaaa5;
}

.bg-actinide {
  background-color: #ffaaa5;
}

/* 状态颜色 */
.bg-gas {
  background-color: #b8e986;
}

.bg-solid {
  background-color: #4dd0e1;
}

.bg-liquid {
  background-color: #ff8a65;
}

.bg-unknown {
  background-color: #e0e0e0;
}

.lanthanide-section,
.actinide-section {
  margin-top: 16px;
}

.section-header {
  width: calc(3 * 80px);
  height: 32px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #374151;
  font-weight: 500;
}

.legend-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-top: 24px;
}

.legend-title {
  color: #374151;
  font-weight: 500;
  margin-bottom: 12px;
  font-size: 14px;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  font-size: 14px;
}

@media (min-width: 768px) {
  .legend-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .legend-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  flex-shrink: 0;
}

:deep(.fullscreen-content) .panel {
  height: 100%;
}
</style>

