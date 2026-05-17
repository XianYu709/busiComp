## 使用方式-组件
`
    <DictSelect
          :only-id="true"
          v-model="select"
          :needs-fields="['学段', '学科', '版本', '模块']" 
        />
`
如果onlyId为true，则返回的为字典id，否则为字典对象
## 使用方式-函数
`
     const allData = await getDictSelectData(params)
`

根据params的值自动返回对应的字典数据列表
参数结构
`
  {
     periodId: '',
     seriesId: '',
    ....
  }`
 

返回结构
`
  {
    subjectList,
    versionList,
    gradeList,
    moduleList,
    ....
  }`