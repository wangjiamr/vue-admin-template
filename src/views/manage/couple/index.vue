<template>
  <div class="app-container" v-loading="loading"
       element-loading-text="loading..."
       element-loading-spinner="el-icon-loading"
       element-loading-background="rgba(0, 0, 0, 0.8)">
    <el-button type="info" style="margin-bottom: 20px;" @click="dialogShow">New</el-button>
    <div class="search_input">
      <el-input placeholder="Enter keywords to search" v-model="params.keyword" class="input-with-select" @keyup.enter.native="query">
        <el-button slot="append" icon="el-icon-search" @click="query"></el-button>
      </el-input>
    </div>
    <el-table  v-loading="listLoading" :data="list"  element-loading-text="Loading" border stripe  fit  highlight-current-row>
    <el-table-column label="Title" width="180">
        <template slot-scope="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column label="gender" width="120">
        <template slot-scope="scope">
          {{ scope.row.gender?'male':'female' }}
        </template>
      </el-table-column>
      <el-table-column label="remarks">
        <template slot-scope="scope">
          {{ scope.row.remarks }}
        </template>
      </el-table-column>
      <el-table-column label="operate">
        <template slot-scope="scope">
          <el-button size="mini"  @click="editShow( scope.row)">Edit </el-button>
          <el-button size="mini" type="danger" @click="handleDisable(scope.row)" v-if="scope.row.useYn==='Y'">Disabled </el-button>
          <el-button size="mini" type="warning"  @click="handleEnable(scope.row)" v-if="scope.row.useYn!=='Y'" >Enable </el-button>
          <el-button size="mini" type="info"  @click="effectDialogShow(scope.row)">Effect</el-button>
          <el-button size="mini" type="info" @click="requireDialogShow(scope.row)">Require</el-button>
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
    <el-dialog :title='id?"Edit Couple":"New Couple"' :visible.sync="dialogVisible" width="30%" close="resetForm">
      <el-form label-width="80px" :model="form" :rules="rules" ref="form">
        <el-form-item label="Title:" prop="title">
          <el-input type="text" v-model="form.title"></el-input>
        </el-form-item>
        <el-form-item label="gender:" prop="gender">
          <el-select v-model="form.gender" prop="gender">
            <el-option
                    v-for="item in genders"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="remarks">
          <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" v-model="form.remarks"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm" v-if="!id">确定</el-button>
        <el-button type="primary" @click="handleEdit" v-else>修改</el-button>
        <el-button @click="resetForm">取 消</el-button>
      </div>
    </el-dialog>


    <!--effect-->
    <el-dialog :title='couple?couple.title+" Effect List":""' :visible.sync="dialogVisibleListEffect" width="50%">
      <el-button type="info" style="margin-bottom: 20px;" @click="dialogShowEffect">New</el-button>
      <el-table v-loading="listLoadingEffect" :data="listEffect" element-loading-text="Loading"  border stripe  fit  highlight-current-row>
        <el-table-column label="Couple" width="180">
          <template slot-scope="scope">
            {{ scope.row.coupleId.title }}
          </template>
        </el-table-column>
        <el-table-column label="operation" width="90">
          <template slot-scope="scope">
            <span>{{getOperationMapping(operations,scope.row.operation)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="attrKey" width="100">
          <template slot-scope="scope">
            {{ getAttrMapping(attrKeys,scope.row.attrKey)}}
          </template>
        </el-table-column>
        <el-table-column label="value" width="100">
          <template slot-scope="scope">
            {{ scope.row.value}}
          </template>
        </el-table-column>
        <el-table-column label="operate">
          <template slot-scope="scope">
            <el-button  size="mini"  @click="editShowEffect( scope.row)">Edit </el-button>
            <el-button  size="mini" type="danger"  @click="deleteEffect(scope.row)">Del </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog :title='idEffect?"Edit Effect":"New Effect"' :visible.sync="dialogVisibleInputEffect" width="30%">
      <el-form label-width="80px" :model="formEffect" :rules="ruleEffect" ref="formEffect">
        <el-form-item label="operation:" prop="operation">
          <el-select v-model="formEffect.operation">
            <el-option
                    v-for="item in operations"
                    :key="item.value"
                    :label="item.text"
                    :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="attrKey:" prop="attrKey">
          <el-select v-model="formEffect.attrKey">
            <el-option
                    v-for="item in filterOperation"
                    :key="item.value"
                    :label="item.text"
                    :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="value:" prop="value">
          <el-input type="text" v-model.number="formEffect.value"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormEffect" v-if="!idEffect">确定</el-button>
        <el-button type="primary" @click="handleEditEffect" v-else>修改</el-button>
        <el-button @click="dialogVisibleInputEffect=false">取 消</el-button>
      </div>
    </el-dialog>

    <!--required-->
    <el-dialog :title='couple?couple.title+"  Require List":""' :visible.sync="dialogVisibleListRequire" width="50%">
      <el-button type="info" style="margin-bottom: 20px;" @click="dialogShowRequire">New</el-button>
      <el-table v-loading="listLoadingRequire" :data="listRequire" element-loading-text="Loading" border  stripe  fit highlight-current-row>
        <el-table-column label="Couple" width="180">
          <template slot-scope="scope">
            {{ scope.row.coupleId.title }}
          </template>
        </el-table-column>
        <el-table-column label="attrKey" width="100">
          <template slot-scope="scope">
            {{ getAttrMapping(attrKeys,scope.row.attrKey)}}
          </template>
        </el-table-column>
        <el-table-column label="value" width="100">
          <template slot-scope="scope">
            {{ scope.row.value}}
          </template>
        </el-table-column>
        <el-table-column label="operate">
          <template slot-scope="scope">
            <el-button  size="mini"  @click="editShowRequire( scope.row)">Edit </el-button>
            <el-button  size="mini"  type="danger"  @click="deleteRequire(scope.row)">Del </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog :title='idRequire?"Edit Require":"New Require"' :visible.sync="dialogVisibleInputRequire" width="30%">
      <el-form label-width="80px" :model="formRequire" :rules="ruleRequire" ref="formRequire">
        <el-form-item label="attrKey:" prop="attrKey">
          <el-select v-model="formRequire.attrKey">
            <el-option
                    v-for="item in filterOperation"
                    :key="item.value"
                    :label="item.text"
                    :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="value:" prop="value">
          <el-input type="text" v-model.number="formRequire.value"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormRequire" v-if="!idRequire">确定</el-button>
        <el-button type="primary" @click="handleEditRequire" v-else>修改</el-button>
        <el-button @click="dialogVisibleInputRequire=false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {getList, add, edit, enable, disable,getOperation,getAttr} from '@/api/couple'
  import {effectList,addEffect,editEffect,deleteEffect} from '@/api/couple'
  import {requireList,addRequire,editRequire,deleteRequire} from '@/api/couple'


  export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      loading: false,
      listLoading: true,
      dialogVisible: false,
      genders: [{label: 'male', value: 1}, {label: 'female', value: 0}],
      params: {
        start: 0,
        limit: 10,
        keyword: ''
      },
      pageObj: {},
      id:null,
      form: {
        title: null,
        gender: null,
        remarks: null
      },
      rules: {
        title: [
          {required: true, message: 'Required field,please entry ', trigger: 'blur'}
        ],
        gender: [
          {required: true, message: 'Required field,please select ', trigger: 'blur'}
        ]
      },
      maleAttr:[],
      femaleAttr:[],
      existAttr:[],
      operations:[],
      attrKeys:[],
      couple:null,
      dialogVisibleListEffect:false,
      dialogVisibleInputEffect:false,
      listEffect: null,
      listLoadingEffect:false,
      paramsEffect: {
        start: 0,
        limit: 10,
        coupleId: ''
      },
      idEffect:null,
      formEffect:{
        coupleId:null,
        operation:null,
        attrKey:null,
        value:null
      },
      ruleEffect:{
        operation: [
          {required: true, message: 'Required field,please select ', trigger: 'blur'}
        ],
        attrKey: [
          {required: true, message: 'Required field,please select ', trigger: 'blur'}
        ],
        value: [
          {required: true, message: 'Required field,please entry ', trigger: 'blur'},
          {type: 'number', message: 'Muset be number'}
        ]
      },
      dialogVisibleListRequire:false,
      dialogVisibleInputRequire:false,
      listRequire: null,
      listLoadingRequire:false,
      paramsRequire: {
        start: 0,
        limit: 10,
        coupleId: ''
      },
      idRequire:null,
      formRequire:{
        coupleId:null,
        attrKey:null,
        value:null
      },
      ruleRequire:{
        attrKey: [
          {required: true, message: 'Required field,please select ', trigger: 'blur'}
        ],
        value: [
          {required: true, message: 'Required field,please entry ', trigger: 'blur'},
          {type: 'number', message: 'Muset be number'}
        ]
      }
    }
  },
  created() {
    this.fetchData()
  },
  computed:{
    filterOperation(){
      if(this.existAttr && this.attrKeys){
        const array=new Array()
        this.attrKeys.forEach(i => {
          const item = this.existAttr.find((ii) => {
            return ii === i.value
          })
          if (!item) {
            array.push(i)
          }
        })
        return array
      }
      return this.attrKeys
    }
  },
  methods: {
    getAttrMapping(array,value){
      if(this.attrKeys.length){
        const item=this.attrKeys.find((i)=>{
          return i.value===value
        })
        if(item){
          return item.text
        }
      }
      return value
    },
    getOperationMapping(array,value){
      if(this.operations.length){
        const item=this.operations.find((i)=>{
          return i.value===value
        })
        if(item){
          return item.text
        }
      }
      return value
    },
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
        gender: null,
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
        gender: row.gender,
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
    },
    effectDialogShow(row){
      this.dialogVisibleListEffect = true
      this.couple = row
      this.paramsEffect.coupleId=row.id
      this.fetchDataEffect()


      if (row.gender === 1 && this.maleAttr.length > 0) {//male
        this.attrKeys = this.maleAttr
      } else if (row.gender === 1 && !this.maleAttr.length) {//male
        getAttr(1).then(({data}) => {
          if (data['errorCode'] === 0) {
            this.maleAttr = data['list']
            this.attrKeys = this.maleAttr
          }
        })
      } else if (row.gender === 0 && this.femaleAttr.length > 0) {//female
        this.attrKeys = this.femaleAttr
      } else if (row.gender === 0 && !this.femaleAttr.length) {//female
        getAttr(0).then(({data}) => {
          if (data['errorCode'] === 0) {
            this.femaleAttr = data['list']
            this.attrKeys = this.femaleAttr
          }
        })
      }
      //operation
      if (!this.operations.length) {
        getOperation().then(({data}) => {
          if (data['errorCode'] === 0) {
            this.operations = data['list']
          }
        })
      }

    },
    fetchDataEffect() {
      this.listLoadingEffect = true
      effectList(this.paramsEffect).then(({data}) => {
        if (data['errorCode'] === 0) {
          this.listEffect = data['list']
        }
        this.listLoadingEffect = false
      })
    },
    dialogShowEffect () {
      if (this.$refs.formEffect) {
        this.$refs.formEffect.resetFields()
      }
      this.idEffect=null
      this.formEffect = {
        coupleId:this.couple.id,
        operation:null,
        attrKey:null,
        value:null
      }
      this.dialogVisibleInputEffect = true
      this.existAttr=[]
      if(this.listEffect.length){
        this.listEffect.forEach((i)=>{
          this.existAttr.push(i.attrKey)
        })
      }
    },
    submitFormEffect () {
      this.$refs.formEffect.validate((valid) => {
        if (valid) {
          this.dialogVisibleInputEffect = false
          addEffect(this.formEffect).then(({data}) => {
            if (data['errorCode'] === 0) {
              this.$message({
                message: '保存成功',
                type: 'success'
              })
              this.fetchDataEffect()
            } else {
              this.$message.error('保存失败')
            }
          })
        } else {
          return false
        }
      })
    },
    editShowEffect(row){
      if (this.$refs.formEffect) {
        this.$refs.formEffect.resetFields()
      }
      this.formEffect = {
        coupleId:row.coupleId.id,
        operation:row.operation,
        attrKey:row.attrKey,
        value:row.value
      }
      this.idEffect=row.id
      this.dialogVisibleInputEffect = true
      this.existAttr=[]
      this.listEffect.forEach((i)=>{
        if(row.id !==i.id){
          this.existAttr.push(i.attrKey)
        }
      })
    },
    handleEditEffect () {
      this.$refs.formEffect.validate((valid) => {
        if (valid) {
          this.dialogVisibleInputEffect = false
          editEffect(Object.assign(this.formEffect,{id:this.idEffect})).then(({data}) => {
            if (data['errorCode'] === 0) {
              this.$message({
                message: '保存成功',
                type: 'success'
              })
              this.fetchDataEffect()
            } else {
              this.$message.error('保存失败')
            }
          })
        } else {
          return false
        }
      })
    },
    deleteEffect ({id}) {
      this.$confirm('确定要删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteEffect({id}).then(({data})=>{
          if (data['errorCode'] === 0) {
            this.$message({
              message: '操作成功',
              type: 'success'
            })
            this.fetchDataEffect()
          } else {
            this.$message.error('操作失败')
          }
        })
      }).catch(error=>{})
    },
    requireDialogShow(row){
      this.dialogVisibleListRequire = true
      this.couple = row
      this.paramsRequire.coupleId=row.id
      this.fetchDataRequire()


      if (row.gender === 1 && this.maleAttr.length > 0) {//male
        this.attrKeys = this.maleAttr
      } else if (row.gender === 1 && !this.maleAttr.length) {//male
        getAttr(1).then(({data}) => {
          if (data['errorCode'] === 0) {
            this.maleAttr = data['list']
            this.attrKeys = this.maleAttr
          }
        })
      } else if (row.gender === 0 && this.femaleAttr.length > 0) {//female
        this.attrKeys = this.femaleAttr
      } else if (row.gender === 0 && !this.femaleAttr.length) {//female
        getAttr(0).then(({data}) => {
          if (data['errorCode'] === 0) {
            this.femaleAttr = data['list']
            this.attrKeys = this.femaleAttr
          }
        })
      }
    },
    fetchDataRequire() {
      this.listLoadingRequire = true
      requireList(this.paramsRequire).then(({data}) => {
        if (data['errorCode'] === 0) {
          this.listRequire = data['list']
        }
        this.listLoadingRequire = false
      })
    },
    dialogShowRequire () {
      if (this.$refs.formRequire) {
        this.$refs.formRequire.resetFields()
      }
      this.idRequire=null
      this.formRequire = {
        coupleId:this.couple.id,
        attrKey:null,
        value:null
      }
      this.dialogVisibleInputRequire = true
      this.existAttr=[]
      if(this.listRequire.length){
        this.listRequire.forEach((i)=>{
          this.existAttr.push(i.attrKey)
        })
      }
    },
    submitFormRequire () {
      this.$refs.formRequire.validate((valid) => {
        if (valid) {
          this.dialogVisibleInputRequire = false
          addRequire(this.formRequire).then(({data}) => {
            if (data['errorCode'] === 0) {
              this.$message({
                message: '保存成功',
                type: 'success'
              })
              this.fetchDataRequire()
            } else {
              this.$message.error('保存失败')
            }
          })
        } else {
          return false
        }
      })
    },
    editShowRequire(row){
      if (this.$refs.formRequire) {
        this.$refs.formRequire.resetFields()
      }
      this.formRequire = {
        coupleId:row.coupleId.id,
        attrKey:row.attrKey,
        value:row.value
      }
      this.idRequire=row.id
      this.dialogVisibleInputRequire = true
      this.existAttr=[]
      this.listRequire.forEach((i)=>{
        if(row.id !==i.id){
          this.existAttr.push(i.attrKey)
        }
      })
    },
    handleEditRequire () {
      this.$refs.formRequire.validate((valid) => {
        if (valid) {
          this.dialogVisibleInputRequire = false
          editRequire(Object.assign(this.formRequire,{id:this.idRequire})).then(({data}) => {
            if (data['errorCode'] === 0) {
              this.$message({
                message: '保存成功',
                type: 'success'
              })
              this.fetchDataRequire()
            } else {
              this.$message.error('保存失败')
            }
          })
        } else {
          return false
        }
      })
    },
    deleteRequire ({id}) {
      this.$confirm('确定要删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteRequire({id}).then(({data})=>{
          if (data['errorCode'] === 0) {
            this.$message({
              message: '操作成功',
              type: 'success'
            })
            this.fetchDataRequire()
          } else {
            this.$message.error('操作失败')
          }
        })
      }).catch(error=>{})
    }
  }
}
</script>
