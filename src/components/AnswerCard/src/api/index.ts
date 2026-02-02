let request: any;
try {
  // @ts-ignore
  request = window.request;
} catch (error) {
  console.error("请检查子项目是否设置了全局axios实例！");
}

export async function getQuestionTypes(params?: object) {
  const res = await request({
    url: "/mainten-center/res/questionType/getList",
    params: {
      ...params,
    },
    method: "get",
  });

  return res.rows.map(item => ({
    label: item.name,
    value: item.id,
    answerType: item.answerType,
  }));
}
