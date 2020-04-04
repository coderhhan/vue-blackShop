<template>
    <div>
      <!--面包屑-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item >商品管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/goods' }">商品列表</el-breadcrumb-item>
        <el-breadcrumb-item >添加商品</el-breadcrumb-item>
      </el-breadcrumb>
      <!--卡片区域-->
      <el-card class="box-card">
        <el-alert

          title="添加商品消息"
          type="info"
          center
          :closable="false"
          show-icon>
        </el-alert>
        <!--步骤条-->
        <el-steps class="steps-class"
          :space="200" :active="activeIndex - 0"
                  finish-status="success"
                  :align-center="true">
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数"></el-step>
          <el-step title="商品属性"></el-step>
          <el-step title="商品图片"></el-step>
          <el-step title="商品内容"></el-step>
          <el-step title="完成"></el-step>
        </el-steps>
        <!--tab 标签页-->
        <!--表单-->
        <el-form :model="addBaseInfoForm"
                 :rules="rules" ref="addBaseInfoFormRef"
                 label-width="100px"
                 class="demo-ruleForm"
                 label-position="top">
          <el-tabs tab-position="left"
                   style="height: 100%;"
                   v-model="activeIndex"
                   :before-leave="beforeLeaveTabs"
          @tab-click="tabClickToggle">
            <el-tab-pane label="基本信息" name="0" >
              <el-form-item label="商品名称" prop="goods_name">
                <el-input v-model="addBaseInfoForm.goods_name"></el-input>
              </el-form-item>
              <el-form-item label="商品价格" prop="goods_price">
                <el-input type="number" v-model="addBaseInfoForm.goods_price"></el-input>
              </el-form-item>
              <el-form-item label="商品重量" prop="goods_weight">
                <el-input type="number" v-model="addBaseInfoForm.goods_weight"></el-input>
              </el-form-item>
              <el-form-item label="商品数量" prop="goods_number">
                <el-input type="number" v-model="addBaseInfoForm.goods_number"></el-input>
              </el-form-item>
              <el-form-item label="商品分类" prop="goods_cat">
                <el-cascader
                  v-model="addBaseInfoForm.goods_cat"
                  :options="CateList"
                  :props="paramsProps"
                  @change="handleChange"
                  style="width: 280px"
                ></el-cascader>
              </el-form-item>
            </el-tab-pane>
            <!--商品动态参数-->
            <el-tab-pane label="商品参数" name="1">
              <el-form-item
                :label="item.attr_name"
                v-for="item in manyTabData"
                :key="item.attr_id">
                <el-checkbox-group
                  v-model="item.attr_vals">
                <el-checkbox v-for="(attr,i) in item.attr_vals" :key="i" :label="attr" border></el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品属性" name="2">
                <el-form-item v-for="item in onlyTabData" :key="item.attr_id" :label=" item.attr_name">
                  <el-input v-model="item.attr_vals"></el-input>
                </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品图片" name="3">
              <el-upload
                class="upload-demo"
                :action="uploadURL"
                :headers="uploadHeaders"
                :on-preview="uploadPreview"
                :on-remove="uploadRemove"
                :on-success="uploadSuccess"
                list-type="picture">
                <el-button size="small" type="primary">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
              </el-upload>
            </el-tab-pane>
            <!--图片预览对话框-->
            <el-dialog
              title="图片预览"
              :visible.sync="preImageVisible"
              width="50%">
              <img :src="preImageURL" class="preImage">
            </el-dialog>
            <el-tab-pane label="商品内容" name="4">
              <!--富文本编辑器-->
              <quill-editor
                ref="myQuillEditor"
                v-model="addBaseInfoForm.goods_introduce"
              />
              <el-button type="primary" @click="addGoods" class="btn-class">添加商品</el-button>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </el-card>
    </div>
</template>

<script>
import { request } from '../../network/request'
import _ from 'lodash'
export default {
  name: 'goodsAdd',
  data () {
    return {
      activeIndex: '0',
      // 分类参数
      CateList: [],
      // 联动选择器的设置
      paramsProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 上传url
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 组件自身封装的ajax请求 没有使用本项目的axios 因此要添加headers
      uploadHeaders: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 商品静态属性
      onlyTabData: [],
      // 添加商品参数数据
      manyTabData: [],
      // 表单数据-基本信息
      addBaseInfoForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        // 上传图片保存数组
        pics: [],
        // 商品介绍
        goods_introduce: '',
        attrs: []
      },
      // 图片预览对话框是否显示
      preImageVisible: false,
      // 预览图片的url路径
      preImageURL: '',
      // deleteImgURl: '',
      // 判断移除图片是否是第一次执行
      deleteCount: 0,
      deleteFinalList: [],
      // 验证规则
      rules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }]
      },
      // 是否切换
      isToggle: false
    }
  },
  computed: {
    // 获取商品分类的id
    CateId () {
      return this.addBaseInfoForm.goods_cat[this.addBaseInfoForm.goods_cat.length - 1]
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取分类数据
    async getCateList () {
      const data = await request({ url: 'categories' })
      console.log(data)
      if (data.meta.status !== 200) return this.$message.error('获取分类失败')
      this.CateList = data.data
    },
    // 当联动选择器选择后触发
    handleChange () {
      if (this.addBaseInfoForm.goods_cat.length !== 3) {
        this.addBaseInfoForm.goods_cat = []
        return this.$message.warning('只允许选择第三级分类')
      }
    },
    // 在切换tabs之前触发
    beforeLeaveTabs (activeName, oldActiveName) {
      // return false
      this.$refs.addBaseInfoFormRef.validate(valid => {
        if (!valid) {
          this.isToggle = false
          return this.$message.error('请填写基本信息')
        } else {
          this.isToggle = true
        }
      })

      if (!this.isToggle) {
        console.log(this.isToggle)
        return false
      } else {
        console.log(this.isToggle)
        return true
      }
    },
    // 切换标签页 触发事件
    async tabClickToggle () {
      // 如果是商品动态参数 ，获取动态参数的数据manyTabData
      if (this.activeIndex === '1') {
        const data = await request({
          url: `categories//${this.CateId}/attributes`,
          params: { sel: 'many' }
        })
        if (data.meta.status !== 200) return this.$message.error('获取商品动态参数失败')
        this.manyTabData = data.data
        // console.log(this.manyTabData.attr_vals)
        this.manyTabData.forEach(attr => {
          if (attr.attr_vals.length > 0) {
            attr.attr_vals = attr.attr_vals.split(' ')
          }
        })
      // 如果切换到商品静态属性 ，获取静态属性数据onlyTabData
      } else if (this.activeIndex === '2') {
        const data = await request({
          url: `categories//${this.CateId}/attributes`,
          params: { sel: 'only' }
        })
        if (data.meta.status !== 200) return this.$message.error('获取商品静态属性失败')
        this.onlyTabData = data.data
        console.log(this.onlyTabData)
      }
    },
    // 上传图片成功触发
    uploadSuccess (response) {
      if (response.meta.status !== 200) return this.$message.error('上传图片失败请重试')
      console.log(response)
      const tmp = { pic: response.data.tmp_path }
      this.addBaseInfoForm.pics.push(tmp)
      console.log(this.addBaseInfoForm.pics)
      // const tmp = { pic: response.data.tmp_path }
      // this.addBaseInfoForm.pics.push(tmp)
    },
    // 上传图片功能‘预览
    uploadPreview (file) {
      this.preImageURL = file.response.data.url
      this.preImageVisible = true
    },
    // 上传图片功能‘移除
    uploadRemove (file) {
      // 获取选中图片的path
      const img = file.response.data.tmp_path
      // 找到pics中图片的索引
      const i = this.addBaseInfoForm.pics.findIndex(x => {
        return x.pic === img
      })
      // 删除数组中i索引的对象
      this.addBaseInfoForm.pics.splice(i, 1)
      console.log(this.addBaseInfoForm.pics)
    },
    // 添加商品确认按钮
    async addGoods () {
      // 深层拷贝添加表单
      const form = _.cloneDeep(this.addBaseInfoForm)
      // goods_cat
      form.goods_cat = form.goods_cat.join(',')
      // attrs 将manytabdata的数据提取push到form.attrs中
      this.manyTabData.forEach(item => {
        const attr = { attr_id: item.attr_id, attr_value: item.attr_vals }
        form.attrs.push(attr)
      })
      this.onlyTabData.forEach(item => {
        const attr = { attr_id: item.attr_id, attr_value: item.attr_vals }
        form.attrs.push(attr)
      })
      const data = await request({
        url: 'goods',
        method: 'POST',
        data: form
      })
      console.log(data)
      if (data.meta.status !== 201) return this.$message.error('添加商品失败')
      this.$message.success('添加商品成功')
      this.$router.push('/goods')
    }
  }
}
</script>

<style lang="less" >
  .el-step__title {
    font-size: 12px;
  }
.el-alert{
  margin-bottom: 20px;
}
  .steps-class{
    margin-bottom: 20px;
  }
  .el-checkbox {
  margin: 0 10px 5px 0px !important;
}
  .preImage {
    width: 100%;
  }
  .ql-editor {
    height: 500px;
  }
  .btn-class {
    margin-top: 15px;
  }
</style>
