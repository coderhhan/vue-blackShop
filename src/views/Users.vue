<template>
  <div>
    <!--面包屑-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区-->
    <el-card class="box-card">
      <!--搜索框-->
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="grid-content bg-purple">
              <el-input placeholder="请输入内容"
                        type="text"
                        clearable
                        v-model="queryinfo.query" @clear="getUserList">
                <el-button slot="append"
                           icon="el-icon-search" @click="getUserList"></el-button>
              </el-input>
           </div>
        </el-col>
        <el-col :span="5">
          <div class="grid-content bg-purple">
            <el-button type="primary" @click="addDialogShow">添加用户</el-button>
          </div></el-col>
      </el-row>
      <!--用户列表table-->
      <el-table
        :data="userList"
        border
        stripe>
        <el-table-column
          type="index">
        </el-table-column>
        <el-table-column
         prop="username"
          label="用户名">
        </el-table-column>
        <el-table-column
          prop="password"
          label="密码">
        </el-table-column>
        <el-table-column
          prop="phone"
          label="电话">
        </el-table-column>
        <el-table-column
          prop="email"
          label="邮箱">
        </el-table-column>
        <el-table-column
          prop="role_name"
          label="类型">
        </el-table-column>
        <el-table-column
          prop="mg_status"
          label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_status"
              active-color="#13ce66"
              @change="userStatusChange(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column
          label="操作" width="180px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editDialogshow(scope.row._id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserConfirm(scope.row._id)"></el-button>
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pageNum"
        :page-sizes="[2, 3, 5, 10]"
        :page-size="queryinfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="allCount">
      </el-pagination>
      <!--添加用户对话框区-->
      <el-dialog
        title="添加用户"
        :visible.sync="isDialogVisible"
        width="30%"
        @close="addDialogClose">
        <!--对话框内容区域-->
        <el-form :model="addForm"
                 :rules="addFormRules"
                 ref="addFormRef" label-width="70px">
          <!--prop命名得跟v-model的子数据一致-->
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password" show-password></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="phone">
            <el-input v-model="addForm.phone" ></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
    <el-button @click="isDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser" >确 定</el-button>
  </span>
      </el-dialog>
      <!--修改用户对话框区-->
      <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="30%"
      @close="editDialogClose">
        <el-form :model="editForm"
                 status-icon
                 :rules="editFormRules"
                 ref="editFormRef"
                 label-width="100px">
          <el-form-item label="用户名">
            <el-input  v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input  v-model="editForm.phone" ></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email" ></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUser">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { request } from '../network/request'
export default {
  name: 'Users',
  data () {
    // 自定义校验规则
    // 邮箱验证
    var checkEmail = (rule, value, callback) => {
      const reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (!reg.test(value)) {
        callback(new Error('请输入正确邮箱'))
      } else {
        return callback()
      }
    }
    // 手机验证
    var checkPhone = (rule, value, callback) => {
      const reg = /^(0|86|17951|12593)?(13[0-9]|15[0-9]|17[6-8]|18[0-9]|14[57])[0-9]{8}$/
      if (reg.test(value)) {
        return callback()
      } else {
        callback(new Error('请输入正确手机号'))
      }
    }
    return {
      // 用户列表数据
      userList: [],
      // 传递参数
      queryinfo: {
        query: '',
        pageSize: 2, // 每页多少条数据
        pageNum: 1 // 页码
      },
      // 所有数据
      allCount: 0,
      // 是否显示提示
      isDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        phone: '',
        email: ''
      },
      // 添加角色校验规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 5, max: 10, message: '长度在 5 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 8, max: 14, message: '长度在 8 到 14 个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ]
      },
      // 修改对话框显示
      editDialogVisible: false,
      editForm: {
        username: '',
        phone: '',
        email: ''
      },
      editFormRules: {
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ]
      }

    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    // 获取用户列表
    async getUserList () {
      // 解构并重命名为res
      const Data = await request(
        {
          url: '/user/list?api_hash=' + new Date().getTime(), // 防止ie缓存
          method: 'GET',
          params: this.queryinfo
        }
      )
      console.log(Data)
      if (Data.meta.status !== 200) { return this.$message.error('获取用户信息失败') }
      this.userList = Data.data.users
      this.allCount = Data.data.allCount
    },
    // 修改每页显示条数
    handleSizeChange (newSize) {
      this.queryinfo.pageSize = newSize
      this.getUserList()
    },
    // 修改当前页码
    handleCurrentChange (newPage) {
      this.queryinfo.pageNum = newPage
      this.getUserList()
    },
    // 修改用户状态
    async userStatusChange (userinfo) {
      console.log(userinfo.mg_status)
      const res = await request({
        url: 'user/status',
        method: 'PUT',
        data: {
          _id: userinfo._id,
          status: userinfo.mg_status
        }
      })
      if (res.status !== 200) {
        this.userinfo.mg_status = !this.userinfo.mg_status
        return this.$message.error('修改状态失败')
      }
      this.$message.success('修改状态成功')
    },
    // 对话框是否弹出
    addDialogShow () {
      this.isDialogVisible = true
    },
    // 重置添加角色表单数据
    addDialogClose () {
      console.log('dialog关闭')
      this.$refs.addFormRef.resetFields()
    },
    // 添加角色预验证+添加数据
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return false
        const data = await request({
          url: 'user/addUser',
          method: 'POST',
          data: this.addForm
        })
        console.log(data)
        if (data.meta.status === 404) {
          return this.$message.error('用户名已存在')
        } else if (data.meta.status === 400) {
          return this.$message.error('添加失败')
        } else {
          this.isDialogVisible = false
          this.$refs.addFormRef.resetFields()
          this.$message.success('添加成功')
        }
      })
    },
    // 显示修改用户信息对话框
    async editDialogshow (id) {
      this.editDialogVisible = true
      const data = await request({ url: '/user/userShowById', params: { id: id } })
      this.editForm = data.data
    },
    // 重置修改角色输入表单数据
    editDialogClose () {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息
    async editUser () {
      // 预验证
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return false
        const data = await request({ url: '/user/editUserById', data: this.editForm, method: 'post' })
        if (data.meta.status !== 200) {
          return this.$message.error('修改失败')
        } else {
          this.$message.success('修改成功')
          this.$refs.editFormRef.resetFields()
          this.editDialogVisible = false
          this.getUserList()
        }
      })
    },
    // 确认是否删除
    async removeUserConfirm (id) {
      const data = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (data === 'confirm') {
        console.log(id)
        console.log(data)
        const result = await request({ url: 'user/removeUserById', data: { _id: id }, method: 'post' })
        console.log(result)
        if (result.meta.status !== 200) {
          this.$message.error('删除失败')
        } else {
          this.$message.success('删除成功')
          this.getUserList()
        }
      } else {
        console.log(data)
        this.$message.info('已取消删除用户操作')
      }
    }
  }
}
</script>

<style scoped>

</style>
