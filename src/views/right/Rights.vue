<template>
    <div>
      <!--面包屑-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>权限列表</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card class="box-card">
        <el-table
          :data="rightsList"
          border
          stripe>
          <el-table-column
            type="index">
          </el-table-column>
          <el-table-column
            prop="authName"
            label="权限名称">
          </el-table-column>
          <el-table-column
            prop="path"
            label="路径">
          </el-table-column>
          <el-table-column
            prop="level"
            label="权限等级">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.level === '1'" >一级</el-tag>
              <el-tag v-else-if="scope.row.level === '2' " type="success">二级</el-tag>
              <el-tag v-else type="warning">三级</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
</template>

<script>
import { request } from '../../network/request'

export default {
  name: 'Rights',
  data () {
    return {
      rightsList: []
    }
  },
  created () {
    this.getRightList()
  },
  methods: {
    async getRightList () {
      const data = await request({
        url: `rights/${'list'}`
      })
      console.log(data)
      if (data.meta.status !== 200) {
        return this.$message.error('列表数据获取失败')
      } else {
        this.rightsList = data.data
      }
    }
  }
}
</script>

<style scoped>
.box-card{
  overflow: auto;
}
</style>
