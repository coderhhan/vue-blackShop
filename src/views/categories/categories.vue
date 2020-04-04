<template>
<div>
  <!--面包屑-->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>商品分类</el-breadcrumb-item>
  </el-breadcrumb>
  <!--卡片区域-->
  <el-card class="box-card">
    <!--添加分类按钮-->
    <el-row :gutter="20">
      <el-col :span="5">
        <div class="grid-content bg-purple cate">
          <el-button type="primary" @click="showAddDialog">添加分类</el-button>
        </div>
      </el-col>
    </el-row>
    <!--树状表格-->
    <tree-table
      index-text="#"
      :border="true"
      :expand-type="false"
      :show-index="true"
      :data="cateList"
      :columns="columns"
      :selection-type="false"
    >
      <!--是否有效-->
      <template slot="status" slot-scope="scope">
        <i class="el-icon-success"
           style="color: lightgreen;"
        v-if="scope.row.cat_deleted === false"></i>
        <i class="el-icon-error"
           style="color: red;"
        v-else></i>
      </template>
      <!--排序列-->
      <template slot="order" slot-scope="scope">
        <el-tag  v-if="scope.row.cat_level === 0" >一级</el-tag>
        <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
        <el-tag type="warning" v-else>三级</el-tag>
      </template>
      <!--操作列-->
      <template slot="options" min-width="100px" slot-scope="scope">
        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEdit(scope.row)">编辑</el-button>
        <el-button type="danger" icon="el-icon-delete" size="mini" @click="isDeleteCate(scope.row)">删除</el-button>
      </template>
    </tree-table>
    <!--分页部分-->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="query.pagenum"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="query.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </el-card>
  <!--添加分类对话框-->
  <el-dialog
    title="添加分类"
    :visible.sync="addDialogVisible"
    width="40%"
    @close="handleClose">
    <el-form :model="CateForm" status-icon :rules="rules" ref="addCateForm" label-width="100px" class="demo-ruleForm">
      <el-form-item label="分类名称" prop="cat_name">
        <el-input  v-model="CateForm.cat_name" ></el-input>
      </el-form-item>
      <el-form-item label="父级分类">
        <!--options 数据源-->
        <!--cateOptions 配置参数对象-->
        <el-cascader
          :clearable="true"
          class="multi-selected"
          v-model="selectedValue"
          :options="getParentCateList"
          :props="cateOptions"
          @change="selectKeys"></el-cascader>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="addDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="addCate">确 定</el-button>
    </span>
  </el-dialog>
  <!--编辑分类对话框-->
  <el-dialog
    title="添加分类"
    :visible.sync="editDialogVisible"
    width="40%"
    @close="editClose">
    <el-form :model="editForm" status-icon :rules="rules" ref="editCateForm" label-width="100px" class="demo-ruleForm">
      <el-form-item label="分类名称" prop="cat_name">
        <el-input  v-model="editForm.cat_name" clearable></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="editDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="editCate">确 定</el-button>
    </span>
  </el-dialog>
</div>
</template>

<script>
import { request } from '../../network/request'
export default {
  name: 'categories',
  data () {
    return {
      // 查询条件
      query: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表
      cateList: [],
      // 总页数
      total: 0,
      // 为tree-table指定列
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示当前列为模板列
          type: 'template',
          // 模板列名称
          template: 'status'
        },
        {
          label: '排序',
          // 表示当前列为模板列
          type: 'template',
          // 模板列名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示当前列为模板列
          type: 'template',
          // 模板列名称
          template: 'options'
        }
      ],
      // 校验规则.
      rules: {
        cat_name: [
          { required: true, message: '请输入分类名称', blur: 'true' }
        ]
      },
      // 添加分类表单数据
      CateForm: {
        cat_pid: 0,
        cat_level: 0,
        cat_name: ''
      },
      // 添加分类表单数据
      editForm: {
        cat_pid: 0,
        cat_level: 0,
        cat_name: ''
      },
      // 是否显示添加分类对话框
      addDialogVisible: false,
      // 一二级分类数据父级分类
      getParentCateList: [],
      // 联动选择器配置
      cateOptions: {
        expandTrigger: 'hover',
        value: 'cat_id',
        children: 'children',
        label: 'cat_name',
        checkStrictly: true
      },
      // 联动选择器选中结果
      selectedValue: [],
      // 编辑分类对话框是否显示
      editDialogVisible: false
    }
  },
  created () {
    this.getCategoriesList()
  },
  methods: {
    // 获取商品分类信息
    async getCategoriesList () {
      const data = await request({ url: 'categories', params: this.query })
      if (data.meta.status !== 200) return this.$message.error('获取商品分类错误')
      this.cateList = data.data.result
      this.total = data.data.total
    },
    // 是否显示删除对话框
    async isDeleteCate (cate) {
      const data = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)
      if (data === 'cancel') return this.$message.info('取消删除商品分类操作')
      const res = await request({ url: `categories/${cate.cat_id}`, method: 'DELETE' })
      if (res.meta.status !== 200) return this.$message.error('删除商品分类失败')
      this.$message.success('删除成功')
      this.getCategoriesList()
    },
    // pagesize 改变时触发
    handleSizeChange (newValue) {
      this.query.pagesize = newValue
      this.getCategoriesList()
    },
    // 页码 改变时触发
    handleCurrentChange (newValue) {
      this.query.pagenum = newValue
      this.getCategoriesList()
    },
    //  是否显示添加分类对话框
    showAddDialog () {
      // 获取一二级分类后显示对话框
      this.getCateList()
      this.addDialogVisible = true
    },
    // 添加分类对话框关闭时清空数据
    handleClose () {
      this.$refs.addCateForm.resetFields()
      this.selectedValue = []
    },
    // 获取一二级分类父级分类
    async getCateList () {
      const data = await request({ url: 'categories', params: { type: 2 } })
      if (data.meta.status !== 200) return this.$message.error('获取父级分类失败')
      this.getParentCateList = data.data
    },
    // 联动选择器选中结果i
    selectKeys () {
      console.log(this.selectedValue)
      // 如果有选中结果，则selectedValue的长度不为0
      // 父级id一定为最后一个数字
      if (this.selectedValue.length > 0) {
        // 父级分类id
        this.CateForm.cat_pid = this.selectedValue[this.selectedValue.length - 1]
        // level 值
        this.CateForm.cat_level = this.selectedValue.length
      } else {
        this.CateForm.cat_pid = 0
        this.CateForm.cat_level = 0
      }
    },
    // 添加分类确定
    addCate () {
      this.$refs.addCateForm.validate(async valid => {
        if (!valid) return this.$message.error('请填写分类名称')
        const data = await request({ url: 'categories', data: this.CateForm, method: 'POST' })
        if (data.meta.status === 201) {
          this.$message.success('商品分类添加成功')
          this.getCategoriesList()
          this.addDialogVisible = false
        }
      })
    },
    // 是否显示编辑分类对话框
    async showEdit (cate) {
      this.editDialogVisible = true
      const data = await request({ url: `categories/${cate.cat_id}` })
      if (data.meta.status !== 200) return this.$message.error('获取该分类信息失败')
      this.editForm = data.data
    },
    editCate () {
      this.$refs.editCateForm.validate(async valid => {
        if (!valid) return this.$message.error('请填写分类名称')
        const data = await request({ url: `categories/${this.editForm.cat_id}`, data: this.editForm, method: 'PUT' })
        if (data.meta.status === 200) {
          this.$message.success('商品分类名称更新成功')
          this.getCategoriesList()
          this.editDialogVisible = false
        }
      })
    },
    editClose () {
      this.$refs.editCateForm.resetFields()
    }
  }
}
</script>

<style scoped>
  .cate {
    margin-bottom: 20px;
  }
  .multi-selected {
    width: 100%;
  }
</style>
