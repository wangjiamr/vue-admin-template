<template>
  <div class="app-container" v-loading="loading"
       element-loading-text="loading..."
       element-loading-spinner="el-icon-loading"
       element-loading-background="rgba(0, 0, 0, 0.8)">
    <el-button type="info" style="margin-bottom: 20px;" @click="dialogShow">新建</el-button>
    <div class="search_input">
      <el-input placeholder="Enter keywords to search" v-model="params.keyword" class="input-with-select" @keyup.enter.native="query">
        <el-button slot="append" icon="el-icon-search" @click="query"></el-button>
      </el-input>
    </div>
    <el-table  v-loading="listLoading" :data="list"  element-loading-text="Loading" border stripe  fit  highlight-current-row>
      <el-table-column label="标题" width="150">
        <template slot-scope="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column label="投入" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.investPrice }}</span>
        </template>
      </el-table-column>
      <el-table-column label="赢得" width="120">
        <template slot-scope="scope">
          {{ scope.row.gainPrice}}
        </template>
      </el-table-column>
      <el-table-column label="概率" width="80">
        <template slot-scope="scope">
          {{ scope.row.probability+'%'}}
        </template>
      </el-table-column>
      <el-table-column label="备注">
        <template slot-scope="scope">
          {{ scope.row.remarks }}
        </template>
      </el-table-column>
      <el-table-column label="操作"  width="150">
        <template slot-scope="scope">
          <el-button size="mini"  @click="editShow( scope.row)">编辑 </el-button>
          <el-button size="mini" type="danger" @click="handleDisable(scope.row)" v-if="scope.row.useYn==='Y'">禁用 </el-button>
          <el-button size="mini" type="warning"  @click="handleEnable(scope.row)" v-if="scope.row.useYn!=='Y'" >启用 </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
            style="margin-top: 20px;"
            @size-change="sizeChange"
            @current-change="pageChange"
            :current-page="pageObj.currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageObj.everyPage"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pageObj.totalRecord">
    </el-pagination>
    <el-dialog :title='id?"编辑":"新建"' :visible.sync="dialogVisible" width="30%" close="resetForm">
      <el-form label-width="100px" :model="form" :rules="rules" ref="form">
        <el-form-item label="标题:" prop="title">
          <el-input type="text" v-model="form.title"></el-input>
        </el-form-item>
        <el-form-item label="投入:" prop="investPrice">
          <el-input type="text" v-model.number="form.investPrice"></el-input>
        </el-form-item>
        <el-form-item label="赢得:" prop="gainPrice">
          <el-input type="text" v-model.number="form.gainPrice"></el-input>
        </el-form-item>

        <el-form-item label="概率:" prop="probability">
          <el-input type="text" v-model.number="form.probability">
            <template slot="append">%</template>
          </el-input>
        </el-form-item>

        <el-form-item label="备注">
          <el-input type="textarea" :autosize="{ minRows: 4, maxRows: 6}" v-model="form.remarks"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm" v-if="!id">确定</el-button>
        <el-button type="primary" @click="handleEdit" v-else>修改</el-button>
        <el-button @click="resetForm">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import {getList, add, edit, enable, disable} from '@/api/luck'

  export default {
  data() {
    return {
      list: null,
      loading: false,
      listLoading: true,
      dialogVisible: false,
      genders: [{label: '男', value: 1}, {label: '女', value: 0}],
      params: {
        start: 0,
        limit: 10,
        keyword: '',
      },
      pageObj: {},
      id:null,
      form: {
        title: null,
        investPrice: null,
        gainPrice: null,
        probability: null,
        remarks: null
      },
      rules: {
        title: [
          {required: true, message: 'Required field,please entry ', trigger: 'blur'}
        ],
        investPrice: [
          {required: true, message: 'Required field,please entry ', trigger: 'blur'},
          {type: 'number', message: 'Muset be number'}
        ],
        gainPrice: [
          {required: true, message: 'Required field,please entry ', trigger: 'blur'},
          {type: 'number', message: 'Muset be number'}
        ],
        probability: [
          {required: true, message: 'Required field,please entry ', trigger: 'blur'},
          {type: 'number', message: 'Muset be number'}
        ]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    query(){
      this.params.start = 0
      this.fetchData()
    },
    fetchData() {
      this.listLoading = true
      getList(this.params).then(({data}) => {
        if (data['errorCode'] === 0) {
          this.list = data['list']
          this.pageObj = data['pageObj']
          this.params.start = this.pageObj['nextIndex']
          this.params.limit = this.pageObj['everyPage']
        }
        this.listLoading = false
      })
    },
    sizeChange (val) {
      this.params.start = 0
      this.params.limit = val
      this.fetchData()
    },
    pageChange (val) {
      this.params.start = (val - 1) * this.pageObj['everyPage']
      this.fetchData()
    },
    dialogShow () {
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
      this.id=null
      this.form = {
        title: null,
        investPrice: null,
        gainPrice: null,
        probability: null,
        remarks: null
      }
      this.dialogVisible = true
    },
    submitForm () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.dialogVisible = false
          this.load = true
          add(this.form).then(({data}) => {
            if (data['errorCode'] === 0) {
              this.$message({
                message: '保存成功',
                type: 'success'
              })
              this.sizeChange(this.params.limit)
            } else {
              this.$message.error('保存失败')
            }
          })
        } else {
          return false
        }
      })
    },
    resetForm () {
      this.$refs.form.resetFields()
      this.dialogVisible = false
    },
    editShow(row){
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
      this.form = {
        title: row.title,
        investPrice: row.investPrice,
        gainPrice: row.gainPrice,
        probability: row.probability,
        remarks: row.remarks
      }
      this.id=row.id
      this.dialogVisible = true
    },
    handleEdit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.dialogVisible = false
          this.load = true
          edit(Object.assign(this.form,{id:this.id})).then(({data}) => {
            if (data['errorCode'] === 0) {
              this.$message({
                message: '保存成功',
                type: 'success'
              })
              this.sizeChange(this.params.limit)
            } else {
              this.$message.error('保存失败')
            }
          })
        } else {
          return false
        }
      })
    },
    handleDisable ({id}) {
      this.$confirm('确定要禁用吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        disable({id}).then(({data})=>{
          if (data['errorCode'] === 0) {
            this.$message({
              message: '操作成功',
              type: 'success'
            })
            this.sizeChange(this.params.limit||10)
          } else {
            this.$message.error('操作失败')
          }
        })
      }).catch(error=>{})
    },
    handleEnable ({id}) {
      this.$confirm('确定要启用吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        enable({id}).then(({data})=>{
          if (data['errorCode'] === 0) {
            this.$message({
              message: '操作成功',
              type: 'success'
            })
            this.sizeChange(this.params.limit||10)
          } else {
            this.$message.error('操作失败')
          }
        })
      }).catch(error=>{})
    }
  }
}
</script>
