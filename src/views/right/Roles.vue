<template>
  <div>
    <!--面包屑-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-button type="primary">添加角色</el-button>
      <el-table
        :data="rolesList"
        border
        stripe>
        <el-table-column
          type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1,li1) in scope.row.children"
              :key="item1.id"
              :class="['bottmline',li1 === 0 ? 'topline' : '','vcneter']"
            >
              <!--一级权限-->
              <el-col :span="5">
              <el-tag closable @close="tagClose(scope.row,item1.id)">
                {{item1.authName}}
              </el-tag>
                <i class="el-icon-caret-right"></i>
             </el-col>
              <!--二三级权限-->
              <el-col :span="19">
                <el-row
                  v-for="(item2,li2) in item1.children"
                  :key="item2.id" :class="[ li2 === 0 ? '' : 'topline','vcneter']"
                  >
                  <el-col :span="6" >
                    <el-tag type="success" closable @close="tagClose(scope.row,item2.id)">
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning"
                            v-for="item3 in item2.children"
                            :key="item3.id" closable
                            @close="tagClose(scope.row,item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column
          type="index">
        </el-table-column>
        <el-table-column
          prop="roleName"
          label="角色">
        </el-table-column>
        <el-table-column
          prop="roleDesc"
          label="角色描述">
        </el-table-column>
          <!--编辑删除分配操作-->
        <el-table-column
          label="操作" min-width="100px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showDialogEditRights(scope.row)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRole(scope.row)">删除</el-button>
            <el-tooltip class="item" effect="dark"  placement="top" :enterable="false" content="分配权限">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showDialogRights(scope.row)">分配权限</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--分配权限dialog-->
    <el-dialog
      title="提示"
      :visible.sync="rightsDialogVisible"
      width="30%"
      @close="setRightsDialogClose">
      <el-tree
        :data="rightTreeData"
        :props="rightsProps"
        default-expand-all
        node-key="id"
        :default-checked-keys="rightsListKeys"
        show-checkbox
        ref="rightsTreeRef"
        >
      </el-tree>
      <span slot="footer" class="dialog-footer">
      <el-button @click="rightsDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="addRights">确 定</el-button>
     </span>
    </el-dialog>

    <!--编辑角色dialog-->
    <el-dialog
      title="提示"
      :visible.sync="editRightsDialogVisible"
      width="30%"
      @close="setRightsDialogClose">
      <el-form :model="editForm" status-icon :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input  v-model="editForm.roleName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" >
          <el-input  v-model="editForm.roleDesc" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item>
      <span>
      <el-button @click="editRightsDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="editRights">确 定</el-button>
     </span>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>

</template>

<script>
import { request } from '../../network/request'
export default {
  name: 'Roles',
  data () {
    return {
      rolesList: [],
      role: [],
      rightsDialogVisible: false,
      editRightsDialogVisible: false,
      rightTreeData: [],
      rightsProps: {
        children: 'children',
        label: 'authName'
      },
      // 存储树状已拥有权限id
      rightsListKeys: [],
      // 保存点分配权限的roleid
      roleId: 0,
      rules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      editForm: {
        roleId: 0,
        roleName: '',
        roleDesc: ''
      }
    }
  },
  // ,rolesList
  created () {
    this.getRolesList()
  },
  methods: {
    async getRolesList () {
      const { data: res } = await request({ url: 'roles' })
      this.rolesList = res
      console.log(res)
      // request2({ url: 'roles' }).then(res => {
      //   console.log(res)
      // })
    },
    async tagClose (role, rightId) {
      const res = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (res === 'confirm') {
        const data = await request({ url: `roles/${role.id}/rights/${rightId}`, method: 'DELETE' })
        role.children = data.data // 使删除成功后数据部分更新
        this.$message.success('权限已删除')
      } else if (res === 'cancel') {
        console.log('取消确认')
        this.$message.info('删除操作已经取消')
      }
    },
    // 分配权限对话框显示
    async showDialogRights (role) {
      const { data: res } = await request({ url: 'rights/tree' })
      this.rightTreeData = res
      // 调用递归让tree默认选中已有权限
      this.getLeafKeys(role, this.rightsListKeys)
      this.roleId = role.id
      this.rightsDialogVisible = true
    },
    // 递归函数获取最后一级权限
    getLeafKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      } else {
        node.children.forEach(item => {
          this.getLeafKeys(item, arr)
        })
      }
    },
    async addRights () {
      // 将选择的key 和半选的key 组成数组
      const rids = [...this.$refs.rightsTreeRef.getCheckedKeys(), ...this.$refs.rightsTreeRef.getHalfCheckedKeys()].join(',')
      const data = await request({ url: `roles/${this.roleId}/rights`, data: { rids }, method: 'POST' })
      if (data.meta.status !== 200) {
        return this.$message.error('更新权限失败')
      }
      this.$message.success('权限分配成功')
      this.rightsDialogVisible = false
      this.getRolesList()
    },
    // 清楚已拥有keys数组
    setRightsDialogClose () {
      this.rightsListKeys = []
    },
    // 是否删除角色
    async deleteRole (role) {
      const data = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (data === 'cancel') return this.$message.info('取消删除操作')
      const isDlete = await request({ url: `roles/${role.id}`, method: 'DELETE' })
      if (isDlete.meta.status !== 200) return this.$message.error('删除角色失败')
      this.$message.success('删除角色成功')
      this.getRolesList()
    },
    // 是否显示编辑dialog
    async showDialogEditRights (role) {
      const data = await request({ url: `roles/${role.id}` })
      if (data.meta.status !== 200) return
      this.editForm = data.data
      this.editRightsDialogVisible = true
    },
    // 确定编辑角色信息
    async editRights () {
      const data = await request({ url: `roles/${this.editForm.roleId}`, data: this.editForm, method: 'PUT' })
      if (data.meta.status !== 200) return this.$message.error('修改失败')
      this.$message.success('修改成功')
      this.getRolesList()
      this.editRightsDialogVisible = false
    }
  }
}
</script>

<style scoped>
.bottmline {
  border-bottom: 1px solid #eee;
}
.topline {
  border-top:1px solid #eee ;
}
.el-tag {
  margin: 7px;
}
 .vcneter {
   display: flex;
   align-items: center;
 }
</style>
