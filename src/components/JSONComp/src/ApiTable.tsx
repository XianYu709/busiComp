import { useFunComp } from "@sjjb/utils";
import {
  ElLoading,
  ElPagination,
  ElButton,
  ElTable,
  ElTableColumn,
  type TableColumnCtx,
  type TableInstance,
  type TableProps,
} from "element-plus";
import { Lock, WarningFilled } from "@element-plus/icons-vue";
import {
  withDirectives,
  type Directive,
  type CSSProperties,
  defineComponent,
  ref,
  watch,
  toRaw,
  useSlots,
  computed,
  nextTick,
} from "vue";
import noDataImg from "./images/noDataImg.png";

export type ColumnItem = Partial<TableColumnCtx> & {
  slots?: Record<string, any>;
  /** 可选：直接传入渲染函数 */
  render?: (scope: any) => any;
  [key: string]: any;
  children?: ColumnItem[];
};

type StyleCallback = (selectList: any[], payload: any) => CSSProperties | undefined;
type props = {
  immediate?: boolean;
  data?: any;
  /* 自行处理数据格式  */
  api?: (args?: any) => Promise<any>;
  /* 接口需要按照一定规则 */
  apiUrl?: string;
  columns?: ColumnItem[];
  dataKey?: string;
  pagination?: {
    pageSize: number; // 每页显示条数
    total?: number; // 总条数（可选）
    layout?: string; // 分页布局，默认 'total, ->, prev, pager, next'
    background?: boolean; // 是否显示背景
  };
  styleCallBack?: StyleCallback;
  maxSelectNumber?: number;
  selectList?: any[];
  selectKey?: string;
  isFull?: boolean;
  apiChangeRefetch?: boolean;
  /** 空状态配置 */
  emptyConfig?: {
    type?: "noData" | "noPermission" | "error"; // 空状态类型
    icon?: string; // 自定义图标（Element Plus Icon 名称）
    title?: string; // 标题
    desc?: string; // 描述
    btnText?: string; // 按钮文字
    onBtnClick?: () => void; // 按钮点击事件
    showBtn?: boolean; // 是否显示按钮
  };
  maxHeight?: number | undefined
} & Partial<TableProps<any>>;

export type TableExpose = {
  fetch: (args?: any) => Promise<void>;
  clearData: () => void;
  getRawData: () => any[];
  getRawDataReference: () => any[];
  dispatchData: (dispatch: (args: any) => any) => void;
  elFuns: TableInstance;
  setSelectList: (rows: any[]) => Promise<void>;
};

export const Table = defineComponent<props>({
  props: {
    immediate: {
      type: Boolean,
      default: true,
    },
    data: {
      type: Array,
    },
    dataKey: {
      type: String,
      default: "rows",
    },
    api: {
      type: Function,
      default: () => {},
    },
    apiUrl: {
      type: String,
      default: "",
    },
    columns: {
      type: Array,
    },
    pagination: {
      type: Object,
    },
    selectList: {
      type: Array,
      default: () => [],
    },
    maxSelectNumber: {
      type: Number,
      default: 2,
    },
    styleCallBack: {
      type: Function,
      default: () => {},
    },
    selectKey: {
      type: String,
      default: "id",
    },
    apiChangeRefetch: {
      type: Boolean,
      default: true,
    },
    isFull: {
      type: Boolean,
      default: false,
    },
    /** 空状态配置 */
    emptyConfig: {
      type: Object,
    },
    maxHeight: {
      type: Number
    }
  },
  emits: ["update:selectList"],
  setup(props, { expose, attrs, emit }) {
    const { immediate, apiUrl } = props;
    const elRef = ref();
    const loading = ref(false);
    const tableData = ref([]);
    const copyTableData = ref([]);
    const columns = computed(() => props.columns || []);

    // 修复错误 确保 pageSize 有默认值
    const page = ref({
      total: 0,
      pageNum: 1,
      pageSize: props.pagination?.pageSize || 10, // 添加默认值10
    });

    const fetch = async (params?: Object) => {
      if (props.data) return;
      const usePage = props?.pagination && Object.keys(props?.pagination).length > 0;
      try {
        loading.value = true;
        let res: any;
        // res = await (apiUrl && request.get(apiUrl,))
        if (!usePage) {
          res = await (props.api && props.api(params));
        } else {
          res = await (props.api &&
            props.api({
              ...params,
              pageSize: page.value.pageSize,
              pageNum: page.value.pageNum,
            }));
        }

        // 安全的响应处理
        if (res && typeof res === "object") {
          // 修复错误 安全访问 total 属性
          page.value.total = usePage ? (res?.total ?? 0) : null;
          tableData.value = res?.[props?.dataKey || "rows"] || [];
        } else {
          console.warn("API响应格式不正确:", res);
          tableData.value = [];
          page.value.total = usePage ? 0 : null;
        }

        copyTableData.value = JSON.parse(JSON.stringify(tableData.value));
        loading.value = false;
      } catch (error) {
        console.error("表格数据获取失败:", error);
        tableData.value = [];
        page.value.total = usePage ? 0 : null;
      } finally {
        loading.value = false;
      }
    };
    immediate != false && fetch();

    const elFuns = new Proxy({} as TableInstance, {
      get: (_target, key) => elRef.value?.[key],
      has: (_target, key) => key in (elRef.value || {}),
    });

    watch(
      () => props.data,
      () => {
        tableData.value = props.data || [];
        copyTableData.value = JSON.parse(JSON.stringify(tableData.value));
      },
      {
        immediate: true,
        deep: true,
      },
    );

    watch(
      () => props.api,
      () => {
        // 重置分页参数到初始值
        page.value.pageNum = 1;
        page.value.pageSize = props.pagination?.pageSize || 10;
        page.value.total = 0;

        props?.apiChangeRefetch == true && fetch();
      },
      {
        deep: true,
      },
    );
    const clearData = () => {
      tableData.value = [];
    };

    const getRawData = () => {
      return toRaw(tableData.value);
    };

    const getRawDataReference = () => {
      return tableData.value;
    };

    const dispatchData = (dispatch: (data: any) => any) => {
      tableData.value = dispatch(copyTableData.value);
    };

    const programmaticSelecting = ref(false);

    const setSelectList = async (rows: any[] = []) => {
      programmaticSelecting.value = true;
      const sliced = (rows || []).filter(Boolean).slice(-maxNumber.value);
      selectList.value = sliced.map(v => toRaw(v));
      await nextTick();
      elRef.value?.setCurrentRow(sliced[sliced.length - 1] || null);
      programmaticSelecting.value = false;
      emit("update:selectList", selectList.value.filter(Boolean));
    };

    expose<TableExpose>({
      clearData,
      getRawData,
      getRawDataReference,
      dispatchData,
      fetch,
      elFuns,
      setSelectList,
    });

    const slots = useSlots();
    const slotsMap: Record<string, any> = {};
    Object.entries(slots).map(([key, fun]) => {
      slotsMap[key.split("-")[1]] = fun;
    });

    const getSlots = (item: columns) => {
      if (item.prop)
        return {
          ...item.slots,
          [item?.render ? "default" : ""]: (...args: any[]) => {
            return item.render ? item.render(...args) : () => null;
          },
          [slotsMap.hasOwnProperty(item.prop) ? "default" : ""]: slotsMap[item.prop],
        };
    };

    const selectList = ref<any[]>([]);

    watch(
      () => props.selectList,
      val => {
        selectList.value = val ? val.map((v: any) => toRaw(v)) : [];
      },
      { immediate: true, deep: true },
    );

    const maxNumber = computed(() => props.maxSelectNumber || 2);
    const selectChange = (row: any) => {
      if (programmaticSelecting.value) return;
      if (props.selectKey) {
        const index = selectList.value.findIndex(
          item => item?.[props.selectKey] === row?.[props.selectKey],
        );
        if (index > -1) {
          selectList.value.splice(index, 1);
        } else {
          if (selectList.value.length >= maxNumber.value) {
            selectList.value.shift();
          }
          selectList.value.push(row);
        }
      }
      emit("update:selectList", selectList.value.filter(Boolean));
    };

    const selectCallback = (row: any) => {
      return props?.styleCallBack && props?.styleCallBack(selectList.value, row);
    };

    const getColumns = cols => {
      if (!cols) return [];
      return cols?.map(col => {
        if (col.children && col.children.length > 0) {
          return <ElTableColumn {...col}>{getColumns(col.children)}</ElTableColumn>;
        } else {
          return <ElTableColumn {...col}>{getSlots(col)}</ElTableColumn>;
        }
      });
    };

    // 空状态默认配置
    const defaultEmptyConfig = computed(() => {
      const type = props.emptyConfig?.type || "noData";
      const configMap = {
        noData: {
          icon: <img src={noDataImg} class='w-196px h-124px emptyNoDataImg' />,
          title: "暂无数据",
          desc: "当前条件下没有找到相关记录",
          btnText: "刷新数据",
          showBtn: false, // 是否显示按钮
          onBtnClick: () => fetch(), // 默认刷新表格
        },
        noPermission: {
          icon: <Lock class='text-4xl text-gray-300' />,
          title: "暂无权限",
          desc: "您没有查看该数据的权限，请联系管理员",
          btnText: "返回",
          showBtn: true,
          onBtnClick: () => window.history.back(),
        },
        error: {
          icon: <WarningFilled class='text-4xl text-orange-400' />,
          title: "加载失败",
          desc: "数据加载出错，请重试或联系技术支持",
          btnText: "重新加载",
          showBtn: true,
          onBtnClick: () => fetch(),
        },
      };
      // 合并用户自定义配置（覆盖默认）
      return { ...configMap[type], ...props.emptyConfig };
    });

    // 在 renderEmpty 中使用计算高度
    // const emptyHeight = computed(() => window.innerHeight - 400 + 'px');

    // 渲染空状态
    const renderEmpty = () => {
      const { icon, title, desc, btnText, showBtn, onBtnClick } = defaultEmptyConfig.value;
      return (
        <div
          class='myApiTableEmptyClass'
          style={{
            height: "", // 调整 高度  emptyHeight.value
            // display: 'flex',
            // flexDirection: 'column',
            // alignItems: 'center',
            // justifyContent: 'center',
            // border: '1px solid #f0f0f0',
            borderRadius: "8px",
            margin: "20px 0",
          }}>
          {/* style={{ marginBottom: '20px' }} */}
          <div class='myApiTableEmptyImg'>{icon}</div>
          <div
            style={{
              fontSize: "16px",
              color: "#333",
              // margin: '0 0 8px 0',
              fontWeight: 500,
              height: "32px",
              lineHeight: "32px",
            }}>
            {title}
          </div>
          <p
            style={{
              fontSize: "14px",
              color: "#666",
              // margin: '0 0 24px 0',
              height: "32px",
              lineHeight: "16px",
            }}>
            {desc}
          </p>
          {showBtn && (
            <ElButton type='primary' plain onClick={onBtnClick} style={{ borderRadius: "4px" }}>
              {btnText}
            </ElButton>
          )}
        </div>
      );
    };

    return () =>
      withDirectives(
        <div class={props.isFull ? "h-full flex flex-col items-center  justify-between" : ""}>
          <ElTable
            ref={elRef}
            class={["w-full", props.isFull ? "flex-1" : ""]}
            {...attrs}
            data={tableData.value}
            max-height={props.maxHeight ? props.maxHeight : undefined}
            onCurrent-change={selectChange}
            row-style={selectCallback}
            v-slots={{
              empty: () => renderEmpty(),
            }}>
            {getColumns(columns.value)}
          </ElTable>
          {props.pagination && Object.keys(props.pagination).length > 0 && (
            <ElPagination
              class='mt-4 -mb-2 w-full'
              layout='total, ->, sizes, prev, pager, next'
              total={page.value.total || 0}
              page-sizes={[4, 5, 6, 7, 8, 10, 20, 30, 40, 50, 100]}
              {...props.pagination}
              v-model:currentPage={page.value.pageNum}
              v-model:page-size={page.value.pageSize}
              onCurrent-change={fetch}
              onSize-change={fetch}
            />
          )}
        </div>,
        [[ElLoading.directive as Directive, loading.value]],
      );
  },
});

export const useTable = (props?: props) => {
  return useFunComp<props>(Table, props);
};
