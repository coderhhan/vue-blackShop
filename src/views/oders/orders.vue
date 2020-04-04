<template>
  <div>
    <!--面包屑-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card class="box-card">
      <!--搜索框-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable @clear="getOrderData" v-model="queryInfo.query"
                    class="input-with-select">
            <el-button slot="append" icon="el-icon-search" @click="getOrderData"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!--订单信息列表-->
      <el-table
        :data="orderTableData"
        stripe
        border
        style="width: 100%">
        <el-table-column
          type="index"
          label="#"
          width="50">
        </el-table-column>
        <el-table-column
          prop="order_number"
          label="订单编号"
        >
        </el-table-column>
        <el-table-column
          prop="order_price"
          label="订单价格（元）"
          align="center"
          width="80"
          min-width="50">
        </el-table-column>
        <el-table-column
          prop="pay_status"
          align="center"
          label="是否付款"
          width="80"
          min-width="50">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.pay_status === '0'">未付款</el-tag>
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="is_send"
          label="是否发货"
          min-width="50"
          align="center"
          width="80"
        >
        </el-table-column>
        <el-table-column
          prop="create_time"
          label="下单时间"
          min-width="180"
          width="180">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column
          prop=""
          label="操作"
          width="120"
          min-width="100">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="editDialogVisible(scope.row)"></el-button>
            <el-button size="mini" type="success" icon="el-icon-location" @click="deliveryDialogVisible(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页去-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!--编辑对话框-->
    <el-dialog
      title="提示"
      :visible.sync="editDialogShow"
      :before-close="editDialogUnShow">
      <el-form ref="editFormRef" :rules="editFormRules"
               :model="editFormData" label-width="100px">
        <el-form-item label="省市区/县" prop="citydata">
          <el-cascader
            v-model="editFormData.citydata"
            :options="citydata"
            :props="{ expandTrigger: 'hover' }"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="detailaddress">
          <el-input v-model="editFormData.detailaddress"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogShow = false">取 消</el-button>
          <el-button type="primary" @click="editDialogShow = false">确 定</el-button>
       </span>
    </el-dialog>

    <el-dialog
      title="物流信息"
      :visible.sync="deliveryDialogShow"
    >
     <el-timeline >
        <el-timeline-item
          v-for="(activity, index) in deliveryData"
          :key="index"
          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    <span slot="footer" class="dialog-footer">
        <el-button @click="deliveryDialogShow = false">取 消</el-button>
        <el-button type="primary" @click="deliveryDialogShow = false">确 定</el-button>
    </span>
    </el-dialog>
  </div>
</template>

<script>
import citydata from './citydata.js'
import { request } from '../../network/request'

export default {
  name: 'orders',
  data () {
    return {
      // 请求订单信息携带的参数信息
      queryInfo: {
        query: '', // 查询信息
        pagenum: 1, // 当前页码
        pagesize: 10, // 每页显示条数
        user_id: '', // 用户id
        pay_status: '', // 支付状态
        is_send: '', // 是否发货
        order_fapiao_title: '', // ['个人','公司']
        order_fapiao_company: '', // 公司名称
        order_fapiao_content: '', // 发票内容
        consignee_addr: '' // 发货地址
      },
      // 数据总页数
      total: 0,
      // 列表数据对象数组
      orderTableData: [],
      // 编辑对话框是否显示
      editDialogShow: false,
      // editForm 表单数据
      editFormData: {
        citydata: [],
        detailaddress: ''
      },
      // 校验规则
      editFormRules: {
        citydata: [
          {
            required: true,
            message: '请输入省市区'
          }
        ],
        detailaddress: [
          {
            required: true,
            message: '请输入详细地址'
          }
        ]
      },
      // 联动选择器的数据options
      citydata,
      // 物流对话框是否显示
      deliveryDialogShow: false,
      // 物流信息数据对象数组
      deliveryData: []
    }
  },
  created () {
    this.getOrderData()
  },
  methods: {
    // 获取订单列表数据
    async getOrderData () {
      console.log(this.queryInfo)
      const data = await request({
        url: 'orders',
        params: this.queryInfo
      })
      console.log(data)
      if (data.meta.status !== 200) return this.$message.error('获取订单数据失败')
      this.orderTableData = data.data.goods
      this.total = data.data.total
    },
    // 分页区 每页多少条显示
    handleSizeChange (num) {
      this.queryInfo.pagesize = num
      this.getOrderData()
    },
    // 分页区 改变页码
    handleCurrentChange (num) {
      this.queryInfo.pagenum = num
      this.getOrderData()
    },
    // 编辑对话框
    editDialogVisible (row) {
      this.editFormData.detailaddress = row.consignee_addr
      this.editDialogShow = true
    },
    // 编辑对话框关闭时
    editDialogUnShow () {
      this.$refs.editFormRef.resetFields()
    },
    // 物流信息对话框显示
    async deliveryDialogVisible (row) {
      const data = await request({
        url: '/kuaidi/1106975712662'
      })
      console.log(data)
      this.deliveryData = data.data
      this.deliveryDialogShow = true
    }
  }
}
</script>

<style scoped>
  .el-cascader {
    width: 100%;
  }
</style>
