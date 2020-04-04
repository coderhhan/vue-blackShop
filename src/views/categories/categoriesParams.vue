<template>
  <div>
    <!--面包屑-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-alert
          title="注意：只允许给第三级分类设置参数"
          type="warning"
          show-icon
          :closable="false">
        </el-alert>
      </div>

      <div class="item">
        选择商品分类：
        <el-cascader
          v-model="selectedKeys"
          :options="CateList"
          :props="paramsProps"
          @change="handleChange"
          style="width: 280px"
         ></el-cascader>
      </div>
      <!--tab页签-->
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <!--动态参数区域-->
          <el-tab-pane label="动态参数" name="many">
            <el-button type="primary" :disabled="isActive" @click="showAddDialog">添加参数</el-button>
            <!--动态参数表格-->
            <el-table
            :data="trendsTableData"
            border stripe
            style="width: 100%">
            <el-table-column type="expand">
              <template slot-scope="scope" class="show-column">
                <el-tag
                  style="margin: 10px 10px 10px 0 "
                  v-for="(tag,i) in scope.row.attr_vals "
                  :key="i"
                  @close="paramsTagClose(scope.row,tag)"
                  closable>
                  {{tag}}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#">
            </el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name">
            </el-table-column>
            <el-table-column
              label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" @click="attrDelete(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          </el-tab-pane>
          <!--静态属性区域-->
          <el-tab-pane label="静态属性" name="only">
            <el-button type="primary" :disabled="isActive" @click="showAddDialog">添加属性</el-button>
            <!--静态属性表格-->
            <el-table
              :data="staticTableData"
              style="width: 100%"
              border stripe>
              <el-table-column type="expand">
                <!--循环渲染tag标签-->
                <template slot-scope="scope">
                  <el-tag
                    style="margin: 10px 10px 10px 0 "
                    v-for="(tag,i) in scope.row.attr_vals "
                    :key="i"
                    @close="paramsTagClose(scope.row,tag)"
                    closable>
                    {{tag}}
                  </el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)">
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column type="index" label="#">
              </el-table-column>
              <el-table-column
                label="属性名称"
                prop="attr_name">
              </el-table-column>
              <el-table-column
                label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" @click="showEditDialog(scope.row)">编辑</el-button>
                  <el-button type="danger" @click="attrDelete(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
    </el-card>
    <!--添加对话框-->
    <el-dialog
      :title="addTitle"
      :visible.sync="paramsDialogVisible"
      width="30%"
      @close="dialogClose"
      >
      <el-form :model="addForm" ref="addValidateForm" label-width="100px" class="demo-ruleForm">
        <el-form-item
          :label="addLabel"
          prop="attr_name"
          :rules="[
      { required: true, message: '不能为空'},
    ]"
        >
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="paramsDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addAttrConfirm">确 定</el-button>
  </span>
    </el-dialog>
    <!--修改对话框-->
    <el-dialog
      :title="editTitle"
      :visible.sync="editParamsDialogVisible"
      width="30%"
      @close="editDialogClose"
    >
      <el-form :model="editForm" ref="editValidateForm" label-width="100px" class="demo-ruleForm">
        <el-form-item
          :label="addLabel"
          prop="attr_name"
          :rules="[
      { required: true, message: '不能为空'},
    ]"
        >
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editParamsDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editAttrConfirm">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
import { request } from '../../network/request'
export default {
  name: 'categoriesParams',
  data () {
    return {
      // 商品分类数据 联动选择器数据源
      CateList: [],
      // 联动选择器的设置
      paramsProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 多级选择器选中的值
      selectedKeys: [],
      // tab页签选中的值
      activeName: 'many',
      // 静态属性数据对象
      staticTableData: [],
      // 动态参数数据对象
      trendsTableData: [],
      // 对话框是否显示
      paramsDialogVisible: false,
      // 编辑对话框是否显示
      editParamsDialogVisible: false,
      // 添加的表单
      addForm: {
        attr_name: ''
      },
      // 编辑的表单
      editForm: {
        attr_name: ''
      },
      // 编辑属性的id
      editAttrId: 0,
      // 折叠区添加属性值
      inputValue: '',
      // tag添加输入框是否显示
      inputVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  computed: {
    // btn是否禁用
    isActive () {
      if (this.selectedKeys.length !== 3) return true
      return false
    },
    // dialog的标题
    addTitle () {
      if (this.activeName !== 'many') {
        return '添加静态属性'
      } else {
        return '添加动态参数'
      }
    },
    editTitle () {
      if (this.activeName !== 'many') {
        return '编辑静态属性'
      } else {
        return '编辑动态参数'
      }
    },
    // input前面的标题
    addLabel () {
      if (this.activeName !== 'many') {
        return '静态属性'
      } else {
        return '动态参数'
      }
    },
    // 分类id
    cateId () {
      return this.selectedKeys[this.selectedKeys.length - 1]
    }
  },
  methods: {
    // 获取商品分类
    async getCateList () {
      const data = await request({ url: 'categories' })
      console.log(data)
      if (data.meta.status !== 200) return this.$message.error('获取分类失败')
      this.CateList = data.data
    },
    // 联动选择器选中时触发
    async handleChange () {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.staticTableData = []
        this.trendsTableData = []
        return this.$message.warning('只允许选择第三级分类')
      }
      // 获取选中分类的数据
      this.getCateParams()
    },
    // 获取选中分类的数据
    async getCateParams () {
      const data = await request({ url: `categories/${this.selectedKeys[this.selectedKeys.length - 1]}/attributes`, params: { sel: this.activeName } })
      if (data.meta.status !== 200) return this.$message.error('获取动态或静态属性错误')
      data.data.forEach(item => {
        // 控制tag input是否显示
        item.inputVisible = false
        // 控制tag input输入的值
        item.inputValue = ''
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
      })
      if (this.activeName === 'only') {
        this.staticTableData = data.data
      } else {
        this.trendsTableData = data.data
      }
    },
    // tab页签 切换时触发
    handleClick () {
      if (this.selectedKeys.length > 0) {
        this.getCateParams()
      }
    },
    // 删除动态属性
    async attrDelete (attr) {
      const data = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (data !== 'confirm') return this.$message.info('删除操作已经取消')
      const res = await request({
        url: `categories/${this.cateId}/attributes/${attr.attr_id}`,
        method: 'DELETE'
      })
      if (res.meta.status !== 200) return this.$message.error('删除操作失败')
      this.$message.success('删除成功')
      this.getCateParams()
      console.log(res)
    },
    // 显示添加对话框
    showAddDialog () {
      this.paramsDialogVisible = true
    },
    // 显示编辑对话框
    async showEditDialog (attr) {
      console.log(attr.attr_id)
      this.editAttrId = attr.attr_id
      const data = await request({
        url: `categories/${this.cateId}/attributes/${attr.attr_id}`,
        params: { attr_sel: this.activeName }
      })
      if (data.meta.status !== 200) return
      this.editForm = data.data
      this.editParamsDialogVisible = true
    },
    // 对话框关闭重置表单
    dialogClose () {
      this.$refs.addValidateForm.resetFields()
      this.addForm.attr_name = ''
    },
    editDialogClose () {
      this.$refs.editValidateForm.resetFields()
      this.editForm.attr_name = ''
    },
    // 确定添加属性
    async addAttrConfirm () {
      // 表单验证
      this.$refs.addValidateForm.validate(async valid => {
        if (!valid) return
        const data = await request({
          url: `categories/${this.cateId}/attributes`,
          method: 'POST',
          data: {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        })
        if (data.meta.status !== 201) return this.$message.error(this.addTitle + '失败')
        this.$message.success(this.addTitle + '成功')
        this.getCateParams()
        this.paramsDialogVisible = false
      })
    },
    // 编辑属性确定
    editAttrConfirm () {
      this.$refs.editValidateForm.validate(async valid => {
        if (!valid) return
        const data = await request({
          url: `categories/${this.cateId}/attributes/${this.editAttrId}`,
          method: 'PUT',
          data: this.editForm
        })
        if (data.meta.status !== 200) return this.$message.error('修改失败')
        this.$message.success('修改成功')
        this.getCateParams()
        this.editParamsDialogVisible = false
      })
    },
    // 显示tag添加输入框
    showInput (row) {
      row.inputVisible = true
      // 让输入框自动获取焦点
      // 当页面重新渲染完毕后会执行$nexTick（）的中的回调函数
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 当敲回车 或者失去焦点时触发
    async handleInputConfirm (row) {
      // 如果输入的内容不合法 将清空值
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }

      // 操作保存数据 并重新渲染
      row.attr_vals.push(row.inputValue)
      this.saveAttrFn('添加', row)
      row.inputValue = ''
      row.inputVisible = false
    },
    async saveAttrFn (msg, row) {
      const data = await request({
        url: `categories/${this.cateId}/attributes/${row.attr_id}`,
        method: 'PUT',
        data: {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      })
      if (data.meta.status !== 200) return this.$message.error(msg + '失败')
      this.$message.success(msg + '成功')
    },
    // tag关闭时 触发put请求保存数据
    async paramsTagClose (row, tag) {
      row.attr_vals.splice(row.attr_vals.indexOf(tag), 1)
      this.saveAttrFn('删除', row)
    }
  }
}
</script>

<style scoped>
.item{
  margin-bottom: 10px;
}
  .show-column {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
  }
  .input-new-tag{
    width: 150px;
  }
</style>
