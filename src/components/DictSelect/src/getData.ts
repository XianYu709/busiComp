// 含缓存 获取字典
// import { useDictAsync } from "@apps/core/utils/dict";

let request: any;
try {
  /* 由哪个子项目调用时使用哪个子项目的axios实例 */
  // @ts-ignore
  request = window.request;
} catch (error) {
  console.error("请检查子项目是否设置了全局axios实例！");
}

function getDicts(dictType: string) {
  return request({
    url: "/system-center/system/dict/data/type/" + dictType,
    method: "get",
  });
}

/*  临时模拟缓存 */
const dictCache = new Map<string, DictDataOption[]>();

export const useDictAsync = async (
  ...args: string[]
): Promise<{ [key: string]: DictDataOption[] }> => {
  const res: { [key: string]: DictDataOption[] } = {};

  const needFetch: string[] = [];
  args.forEach(dictType => {
    if (dictCache.has(dictType)) {
      res[dictType] = dictCache.get(dictType)!;
    } else {
      needFetch.push(dictType);
    }
  });

  if (needFetch.length > 0) {
    const results = await Promise.all(needFetch.map(dictType => getDicts(dictType)));

    needFetch.forEach((dictType, i) => {
      const list = results[i].data.map(
        (p: any): DictDataOption => ({
          label: p.dictLabel,
          value: p.dictValue,
          elTagType: p.listClass,
          elTagClass: p.cssClass,
        }),
      );
      dictCache.set(dictType, list); // 存入缓存
      res[dictType] = list;
    });
  }

  return res;
};

export default async function getDictSelectData(opt: { [key: string]: string | number }) {
  const getSingleDict = async (key: string) => {
    const resp = await useDictAsync(key);
    return resp[key];
  };

  const { sys_period, sys_edition } = await useDictAsync("sys_period", "sys_edition");

  let subjectList: any = [];
  let seriesList = [];
  let versionList = [];
  let gradeList: any = [];
  let moduleList = [];

  /* 有学段时查询 */
  if (opt?.periodId) {
    const res = await request({
      url: "/mainten-center/bookserials/bookSeries/list",
      method: "get",
      params: {
        periodId: opt.periodId,
        pageNum: 1,
        pageSize: 1000,
      },
    });
    seriesList = res.rows.map((item: any) => ({ label: item.seriesName, value: item.id }));

    const subjectMaps: any = {
      1: "sys_1_subject",
      2: "sys_2_subject",
      3: "sys_3_subject",
    };
    subjectList = await getSingleDict(subjectMaps[opt.periodId]);

    const gradeMaps: any = {
      1: "sys_1_grade",
      2: "sys_2_grade",
      3: "sys_3_grade",
    };
    gradeList = await getSingleDict(gradeMaps[opt.periodId]);
  }

  /* 有学段和科目时 */
  if (opt?.periodId && opt?.subjectId) {
    const res = await request({
      url: "/mainten-center/base/bookVersion/list",
      method: "get",
      params: {
        periodId: opt.periodId,
        subjectId: opt.subjectId,
        pageNum: 1,
        pageSize: 1000,
      },
    });
    versionList = res.rows.map((item: any) => ({ label: item.versionName, value: item.id }));
  }

  /* 有学段和科目和版本时 */
  if (opt?.periodId && opt?.subjectId && opt?.versionId) {
    const res = await request({
      url: "/mainten-center/base/bookModel/list",
      method: "get",
      params: {
        periodId: opt.periodId,
        subjectId: opt.subjectId,
        versionId: opt.versionId,
        pageNum: 1,
        pageSize: 1000,
      },
    });
    moduleList = res.rows.map((item: any) => ({ label: item.modelName, value: item.id }));
  }

  return {
    periodList: sys_period,
    seriesList,
    subjectList,
    versionList,
    gradeList,
    moduleList,
    editionList: sys_edition,
  };
}
