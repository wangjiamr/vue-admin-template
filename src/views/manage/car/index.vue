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
      <el-table-column label="汽车" width="170">
        <template slot-scope="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column label="买入价格" width="100">
        <template slot-scope="scope">
          {{ scope.row.buyPrice }}
        </template>
      </el-table-column>
      <el-table-column label="卖出价格" width="100">
        <template slot-scope="scope">
          {{ scope.row.sellPrice }}
        </template>
      </el-table-column>
      <el-table-column label="买入跌涨幅" width="100">
        <template slot-scope="scope">
          {{ scope.row.offsetBuy }}
        </template>
      </el-table-column>
      <el-table-column label="卖出跌涨幅" width="100">
        <template slot-scope="scope">
          {{ scope.row.offsetSell }}
        </template>
      </el-table-column>
      <el-table-column label="备注" >
        <template slot-scope="scope">
          {{ scope.row.remarks }}
        </template>
      </el-table-column>
      <el-table-column label="增益" width="70">
        <template slot-scope="scope">
          <el-popover  placement="top"   trigger="hover">
            <el-table  :data="scope.row.effectList"  border stripe  fit  highlight-current-row>
              <el-table-column label="效果" width="90">
                <template slot-scope="scope">
                  <span>{{getOperationMapping(operations,scope.row.operation)}}</span>
                </template>
              </el-table-column>
              <el-table-column label="影响属性" width="100">
                <template slot-scope="scope">
                  {{ getAttrMapping(attrKeys,scope.row.attrKey)}}
                </template>
              </el-table-column>
              <el-table-column label="影响值" width="100">
                <template slot-scope="scope">
                  {{ scope.row.value}}
                </template>
              </el-table-column>
            </el-table>
            <el-tag type="danger" size="medium" slot="reference">查看</el-tag>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="235">
        <template slot-scope="scope">
          <el-button size="mini"  @click="editShow( scope.row)">编辑 </el-button>
          <el-button size="mini" type="danger"   @click="handleDisable(scope.row)" v-if="scope.row.useYn==='Y'">禁用 </el-button>
          <el-button size="mini" type="warning"  @click="handleEnable(scope.row)" v-if="scope.row.useYn!=='Y'" >启用 </el-button>
          <el-popover  placement="top"   trigger="hover">
            <el-button size="mini" type="info"     @click="effectDialogShow(scope.row)">增益</el-button>
          <!--<el-button size="mini" type="info"     @click="eventDialogShow(scope.row)">新建事件</el-button>-->
          <!--<el-button size="mini" type="info"     @click="eventView(scope.row)">查看事件</el-button>-->
            <el-tag type="success" size="medium" slot="reference" style="margin-left: 10px">更多操作</el-tag>
          </el-popover>
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
        <el-form-item label="汽车:" prop="title">
          <el-input type="text" v-model="form.title"></el-input>
        </el-form-item>
        <el-form-item label="买入价格:" prop="buyPrice">
          <el-input type="text" v-model.number="form.buyPrice"></el-input>
        </el-form-item>
        <el-form-item label="卖出价格:" prop="sellPrice">
          <el-input type="text" v-model.number="form.sellPrice"></el-input>
        </el-form-item>
        <el-form-item label="买入涨跌幅:">
          <el-input type="text" v-model.number="form.offsetBuy">
            <template slot="append">%</template>
          </el-input>
        </el-form-item>
        <el-form-item label="卖出涨跌幅:">
          <el-input type="text" v-model.number="form.offsetSell">
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


    <!--Effect-->
    <el-dialog :title='car?car.title+"  增益列表":""' :visible.sync="dialogVisibleListEffect" width="50%">
      <el-button type="info" style="margin-bottom: 20px;" @click="dialogShowEffect">New</el-button>
      <el-table
              v-loading="listLoadingEffect"
              :data="listEffect"
              element-loading-text="Loading"
              border
              stripe
              fit
              highlight-current-row>
        <el-table-column label="汽车" width="180">
          <template slot-scope="scope">
            {{ scope.row.carId.title }}
          </template>
        </el-table-column>
        <el-table-column label="效果" width="90">
          <template slot-scope="scope">
            <span>{{getOperationMapping(operations,scope.row.operation)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="影响属性" width="100">
          <template slot-scope="scope">
            {{ getAttrMapping(attrKeys,scope.row.attrKey)}}
          </template>
        </el-table-column>
        <el-table-column label="影响值" width="100">
          <template slot-scope="scope">
            {{ scope.row.value}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" @click="editShowEffect( scope.row)">编辑 </el-button>
            <el-button size="mini" type="danger" @click="deleteEffect(scope.row)">删除 </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog :title='idEffect?"编辑":"新建"' :visible.sync="dialogVisibleInputEffect" width="30%">
      <el-form label-width="100px" :model="formEffect" :rules="ruleEffect" ref="formEffect">
        <el-form-item label="效果:" prop="operation">
          <el-select v-model="formEffect.operation">
            <el-option
                    v-for="item in operations"
                    :key="item.value"
                    :label="item.text"
                    :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="影响属性:" prop="attrKey">
          <el-select v-model="formEffect.attrKey">
            <el-option
                    v-for="item in filterOperation"
                    :key="item.value"
                    :label="item.text"
                    :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="影响值:" prop="value">
          <el-input type="text" v-model.number="formEffect.value"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormEffect" v-if="!idEffect">确定</el-button>
        <el-button type="primary" @click="handleEditEffect" v-else>修改</el-button>
        <el-button @click="dialogVisibleInputEffect=false">取 消</el-button>
      </div>
    </el-dialog>

    <!---event-->
    <el-dialog :title='formEvent.id?"编辑":"新建"' :visible.sync="dialogVisibleInputEvent" width="50%">
      <el-form label-width="100px" :model="formEvent" :rules="ruleEvent" ref="formEvent">
        <el-form-item label="事件内容:" prop="content">
          <el-input type="textarea" :autosize="{ minRows: 4, maxRows: 6}"  v-model.number="formEvent.content"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormEvent">确定</el-button>
        <el-button @click="dialogVisibleInputEvent=false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {getList, add, edit, enable, disable,getOperation,getAttr} from '@/api/car'
  import {effectList,addEffect,editEffect,deleteEffect} from '@/api/car'
  import {addEvent,eventList,module} from'@/api/car'


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
        params: {
          start: 0,
          limit: 10,
          keyword: ''
        },
        pageObj: {},
        id:null,
        form: {
          title: null,
          buyPrice:null,
          sellPrice:null,
          remarks: null,
          offsetBuy:null,
          offsetSell:null
        },
        rules: {
          title: [
            {required: true, message: 'Required field,please entry ', trigger: 'blur'}
          ],
          buyPrice: [
            {required: true, message: 'Required field,please entry ', trigger: 'blur'},
            {type: 'number', message: 'Muset be number'}
          ],
          sellPrice: [
            {required: true, message: 'Required field,please entry ', trigger: 'blur'},
            {type: 'number', message: 'Muset be number'}
          ]
        },
        existAttr:[],
        operations:[],
        attrKeys:[],
        car:null,
        dialogVisibleListEffect:false,
        dialogVisibleInputEffect:false,
        listEffect: [],
        listLoadingEffect:false,
        paramsEffect: {
          start: 0,
          limit: 10,
          carId: ''
        },
        idEffect:null,
        formEffect:{
          carId:null,
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
        dialogVisibleInputEvent:false,
        formEvent:{
          carId:null,
          content:null,
          id:null
        },
        ruleEvent:{
          content: [
            {required: true, message: 'Required field,please entry ', trigger: 'blur'}
          ]
        }
      }
    },
    created() {
      this.fetchData()
      this.init()
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
          buyPrice:null,
          sellPrice:null,
          remarks: null,
          offsetBuy:null,
          offsetSell:null
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
          buyPrice:row.buyPrice,
          sellPrice:row.sellPrice,
          remarks: row.remarks,
          offsetBuy:isNaN(row.offsetBuy)?0:row.offsetBuy,
          offsetSell:isNaN(row.offsetSell)?0:row.offsetSell
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
        this.car = row
        this.paramsEffect.carId=row.id
        this.fetchDataEffect()


        if ( !this.attrKeys.length) {//male
          getAttr(1).then(({data}) => {
            if (data['errorCode'] === 0) {
              this.attrKeys = data['list']
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
          carId:this.car.id,
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
          carId:row.carId.id,
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
      eventDialogShow({id}){
        if (this.$refs.formEvent) {
          this.$refs.formEvent.resetFields()
        }
        this.formEvent = {
          carId:id,
          content:null,
          id:null
        }
        this.dialogVisibleInputEvent = true
      },
      submitFormEvent(){
        this.$refs.formEvent.validate((valid) => {
          if (valid) {
            this.dialogVisibleInputEvent = false
            addEvent(this.formEvent).then(({data}) => {
              if (data['errorCode'] === 0) {
                this.$message({
                  message: '添加成功',
                  type: 'success'
                })
                //this.fetchDataEvent()
              } else {
                this.$message.error('添加失败')
              }
            })
          } else {
            return false
          }
        })
      },
      eventView(row){
        this.$router.push(`/manage/event/${module}/${row.id}/1`)
      },
      init(){
        //operation
        getOperation().then(({data}) => {
          if (data['errorCode'] === 0) {
            this.operations = data['list']
          }
        })
        //attr
        getAttr(1).then(({data}) => {
          if (data['errorCode'] === 0) {
            this.attrKeys = data['list']
          }
        })
      }
    }
  }
</script>
