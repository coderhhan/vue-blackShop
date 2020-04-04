<template>
    <div>
      <!--面包屑-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!--卡片区域-->
      <el-card class="box-card">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input placeholder="请输入内容"
                      type="text"
                      v-model="queryInfo.query"
                      @clear="getGoodsList"
                      clearable>
              <el-button slot="append"
                         icon="el-icon-search"   @click="getGoodsList"/>
            </el-input>
          </el-col>
          <el-col :span="5">
            <el-button type="primary" @click="goAddPage">添加商品</el-button>
          </el-col>
        </el-row>
        <!--商品列表-->
        <el-table
          stripe
          border
          :data="goodsList"
          style="width: 100%">
          <el-table-column
            label="#"
            type="index"/>
          <el-table-column
            label="商品ID"
            prop="goods_id"
            min-width="70"/>
          <el-table-column
            prop="goods_name"
            label="商品名称"
            width="680">
          </el-table-column>
          <el-table-column
            prop="goods_price"
            label="商品价格(元)">
          </el-table-column>
          <el-table-column
            prop="goods_number"
            label="商品数量"
            min-width="50">
          </el-table-column>
          <el-table-column
            label="创建时间"
            min-width="150">
            <template slot-scope="scope">
              {{ scope.row.add_time | dateFormat }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            min-width="120">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)"></el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="showDeleteDialog(scope.row)"></el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--分页区-->
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
      <!--对话框区域-->
      <el-dialog
        class="form-dialog"
        title="编辑商品"
        :visible.sync="editDialogVisible"
        width="60%"
        @close="editDialogClosed"
        >
        <!--//基本信息-->
      <el-form :model="editFromData" :rules="editFormRules" ref="editFromREF">
        <el-row type="flex" :gutter="10" class="row-bg" >
          <el-col :span="6">
            <el-form-item label="商品名称 :" prop="goods_name">
              <el-tooltip :content="editFromData.goods_name" placement="top">
            <el-input placeholder="商品名称" v-model="editFromData.goods_name"></el-input>
              </el-tooltip>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="商品价格 :" prop="goods_price">
                <el-input placeholder="商品价格" v-model="editFromData.goods_price"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="商品重量 :" prop="goods_weight">
              <el-input placeholder="商品重量" v-model="editFromData.goods_weight"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="商品数量 :" prop="goods_number">
              <el-input placeholder="商品数量" v-model="editFromData.goods_number"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <!--商品参数-->
        <el-row type="flex" :gutter="10" class="row-bg" >
            <!--商品参数-->
            <el-form-item >
              <span>商品参数 :</span>
            <el-col class="goods-params">
              <el-form-item v-for="item in editFromData.attrs"
                            :key="item.attr_id"
                            :label=" item.attr_name"
                            >
                <el-input v-model="item.attr_value" size="small"/>
              </el-form-item>
            </el-col>
            <!--分割线-->
            <!--商品属性-->
            </el-form-item>
          </el-row>
        <!--商品照片-->
        <el-form-item >
          <span>商品照片 :</span>
          <el-upload
            :file-list="fileListPics"
            :action="uploadURL"
            :headers="uploadHeaders"
            list-type="picture-card"
            :on-preview="handlePictureCardPreview"
            :on-success="handleCurrentSecleted"
            :on-remove="handleRemove">
            <i class="el-icon-plus"></i>
          </el-upload>
         </el-form-item>
        <!--商品描述-->
        <el-row >
          <el-form-item >
         <span>商品描述 :</span>
                <quill-editor
                  class="quillClass"
                  ref="myQuillEditor"
                  v-model="editFromData.goods_introduce"
                />
            </el-form-item>
        </el-row>
      </el-form>
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editFormFinish">提交</el-button>
      </el-dialog>
      <!--商品照片预览-->
      <el-dialog :visible.sync="predialogVisible">
        <img width="100%" :src="preImageURL" alt="">
      </el-dialog>
    </div>
</template>

<script>
import { request } from '../../network/request'
import _ from 'loadsh'
export default {
  name: 'categoriesGoods',
  data () {
    return {
      // 商品列表数据
      goodsList: [],
      // 获取数据的参数
      queryInfo: {
        // 搜索框输入的值
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 总页码
      total: 0,
      // 编辑商品的数据from
      editFromData: {
        goods_id: 0,
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        pics: [],
        attrs: [],
        goods_introduce: ''
      },
      fileListPics: [],
      tempList: [],
      uploadImag: [],
      // 编辑商品的id
      editId: 0,
      // 显示编辑对话框的
      editDialogVisible: false,
      // 图片预览对话框
      predialogVisible: false,
      preImageURL: '',
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 组件自身封装的ajax请求 没有使用本项目的axios 因此要添加headers
      uploadHeaders: {
        Authorization: window.sessionStorage.getItem('token')
      },
      editFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        attr_value: [{ required: true, message: '请选择商品参数', trigger: 'blur' }]
      }
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 商品数据获取
    async getGoodsList () {
      const data = await request({
        url: 'goods',
        params: this.queryInfo
      })
      if (data.meta.status !== 200) return this.$message.error('获取商品数据失败')
      this.goodsList = data.data.goods
      this.total = data.data.total
      console.log(data)
    },
    // 页面数改变时触发
    handleSizeChange (newValue) {
      if (newValue === this.queryInfo.pagesize) return
      this.queryInfo.pagesize = newValue
      this.getGoodsList()
    },
    // 页码改变时触发
    handleCurrentChange (newValue) {
      if (newValue === this.queryInfo.pagenum) return
      this.queryInfo.pagenum = newValue
      this.getGoodsList()
    },
    // 编辑商品按钮
    async showEditDialog (row) {
      this.editId = row.goods_id
      const data = await request({
        url: `goods/${row.goods_id}`
      })
      // console.log(data)
      if (data.meta.status !== 200) return this.$message.error('获取商品数据失败')
      this.editFromData = data.data
      console.log(data)
      this.editFromData.pics.forEach(item => {
        const temp = {
          name: item.pics_id,
          url: item.pics_big_url,
          pic: item.pics_big_url
        }
        this.fileListPics.push(temp)
      })
      console.log(this.fileListPics)
      this.editDialogVisible = true
      this.deleteFinalList = _.cloneDeep(this.editFromData.pics)
      this.deleteCount = 1
    },
    async editFormFinish () {
      const form = _.cloneDeep(this.editFromData)
      console.log(this.deleteFinalList)
      form.pics = this.deleteFinalList
      // console.log(form.pics)
      // const i = form.pics.findIndex((item) => {
      //   return this.deleteImgURl === item.pics_big_url
      // })
      // if (i > 0) {
      //   form.pics.splice(i, 1)
      //   this.deleteImgURl = ''
      // }
      const data = await request({
        url: `goods/${this.editId}`,
        data: form,
        method: 'PUT'
      })
      console.log(data)
      if (data.meta.status !== 200) return this.$message.error('修改商品失败')
      this.fileListPics = []
      this.deleteFinalList = []
      this.$message.success('修改商品成功')
      this.getGoodsList()
      this.editDialogVisible = false
    },
    // 编辑对话框关闭
    editDialogClosed () {
      this.tempList = []
      this.fileListPics = []
      this.$refs.editFromREF.resetFields()
    },
    // 图片预览
    handlePictureCardPreview  (file) {
      this.preImageURL = file.url
      this.predialogVisible = true
    },
    handleCurrentSecleted (response) {
      console.log('111')
      console.log(response)
      if (response.meta.status !== 200) return this.$message.error('上传图片失败请重试')
      const tmp = { pic: response.data.tmp_path, url: response.data.url }
      this.deleteFinalList.push(tmp)
      console.log(this.tempList)
    },
    // 删除图片
    handleRemove (file) {
      // console.log(file)
      // this.deleteImgURl = file.url
      // if (!this.deleteFinalList) {
      this.deleteCount++
      console.log(this.deleteCount)
      // const list = _.cloneDeep(this.editFromData.pics)
      // 第一次触发是 push以下 之后第二次将不在push
      if (this.deleteCount === 2) {
        this.deleteFinalList.push(...this.tempList)
        const i = this.deleteFinalList.findIndex((item) => {
          return file.url === item.pics_big_url
        })
        if (i > 0) {
          this.deleteFinalList.splice(i, 1)
        }
      } else {
        const i = this.deleteFinalList.findIndex((item) => {
          return file.url === item.pics_big_url
        })
        if (i > 0) {
          this.deleteFinalList.splice(i, 1)
        }
      }

      // } else {
      //   const i = this.deleteFinalList.findIndex((item) => {
      //     return file.url === item.pics_big_url
      //   })
      //   if (i > 0) { this.deleteFinalList.splice(i, 1) }
      // }
      // console.log(i)
      const j = this.fileListPics.findIndex(y => {
        return y.url === file.url
      })
      this.fileListPics.splice(j, 1)
      // console.log(this.fileListPics)
    },
    // 删除商品按钮
    async showDeleteDialog (row) {
      const data = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (data === 'cancel') return this.$message.info('删除操作已取消')
      const res = await request({
        url: `goods/${row.goods_id}`,
        method: 'DELETE'
      })
      if (res.meta.status !== 200) return this.$message.error('删除商品失败')
      this.$message.success('删除商品成功')
      this.getGoodsList()
    },
    // 跳转到添加商品页面
    goAddPage () {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" >
.form-dialog {
  padding: 10px !important;
}
  .goods-params {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
  }
.ql-editor {
  height: 400px;
}
</style>
