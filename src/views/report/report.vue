<template>
    <div>
      <!--面包屑-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>数据统计</el-breadcrumb-item>
        <el-breadcrumb-item>数据报表</el-breadcrumb-item>
      </el-breadcrumb>
      <!--卡片区-->
      <el-card class="box-card">
        <div id="main" style="width: 600px;height:400px;"></div>
      </el-card>
    </div>
</template>

<script>
import { request } from '../../network/request'
import echarts from 'echarts'
import _ from 'loadsh'
export default {
  name: 'report',
  data () {
    return {
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  async mounted () {
    var myChart = echarts.init(document.getElementById('main'))
    const data = await request({
      url: 'reports/type/1'
    })
    const result = _.merge(this.options, data.data)
    myChart.setOption(result)
  }

}
</script>

<style scoped>

</style>
