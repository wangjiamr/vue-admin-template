<template>
  <div class="app-container" v-loading="listLoadingEvent"
       element-loading-text="loading..."
       element-loading-spinner="el-icon-loading"
       element-loading-background="rgba(0, 0, 0, 0.8)">
    <el-button type="info" style="margin-bottom: 20px;" @click="dialogShow">New</el-button>
    <div class="search_input">
      <el-input placeholder="Enter keywords to search" v-model="paramsEvent.keyword" class="input-with-select" @keyup.enter.native="query">
        <el-select v-model="paramsEvent.source" slot="prepend" placeholder="Select" style="width: 140px;" @change="query">
          <el-option v-for="item in eventSourceList"
                     :key="item.value"
                     :label="item.text"
                     :value="item.value"></el-option>
        </el-select>
        <el-button slot="append" icon="el-icon-search" @click="query"></el-button>
      </el-input>
    </div>

    <el-table  v-loading="listLoadingEvent" :data="listEvent"  element-loading-text="Loading"  border  stripe  fit  highlight-current-row>

      <el-table-column type="expand">
        <template slot-scope="props">
          <el-table :data="props.row.resultList">
            <el-table-column type="expand">
              <template slot-scope="result">
                <el-table :data="result.row.effectList">
                  <el-table-column label="效果" width="90">
                    <template slot-scope="scope">
                      <el-tag :type='getOperationMapping(operations,scope.row.operation)==="+"?"danger":"success"'>
                        {{getOperationMapping(operations,scope.row.operation)}}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="影响属性" width="100">
                    <template slot-scope="scope">
                      {{ getAttrMapping(attrKeys,scope.row.attrKey)}}
                    </template>
                  </el-table-column>
                  <el-table-column label="影响值" width="100">
                    <template slot-scope="scope">
                      <el-tag :type='getOperationMapping(operations,scope.row.operation)==="+"?"danger":"success"'>{{ getOperationMapping(operations,scope.row.operation)+ scope.row.value +(scope.row.percent==='Y'?'%':'')}}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="是否百分比" width="150">
                    <template slot-scope="scope">
                      {{ scope.row.percent==='Y'?'是':'否'}}
                    </template>
                  </el-table-column>
                  <el-table-column label="操作">
                    <template slot-scope="scope">
                      <el-button size="mini" @click="editShowEffect( result.row.effectList,scope.row)">编辑 </el-button>
                      <el-button size="mini" type="danger" @click="deleteEffect(scope.row)">删除 </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </template>
            </el-table-column>
            <el-table-column label="事件选项"  width="180">
              <template slot-scope="scope">
                {{ scope.row.resultText}}
              </template>
            </el-table-column>
            <el-table-column label="事件结果描述">
              <template slot-scope="scope">
                {{ scope.row.content}}
              </template>
            </el-table-column>
            <el-table-column label="限制" width="100">
              <template slot-scope="scope">
                {{ getRequire(compareList,scope.row)}}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="250">
              <template slot-scope="scope">
                <el-button size="mini" @click="editShowResult( scope.row)">编辑</el-button>
                <el-button size="mini" type="danger" @click="handleDisableResult(scope.row)"
                           v-if="scope.row.useYn==='Y'">禁用
                </el-button>
                <el-button size="mini" type="warning" @click="handleEnableResult(scope.row)"
                           v-if="scope.row.useYn!=='Y'">启用
                </el-button>
                <el-popover  placement="top"   trigger="hover">
                  <el-button size="mini" type="info" @click="dialogShowEffect(scope.row)">增益</el-button>
                  <el-button size="mini" type="info" @click="dialogShowRequire(scope.row)">限制</el-button>
                  <el-button size="mini" type="danger" @click="clearRequire(scope.row)">取消限制</el-button>
                  <el-button size="mini" type="success"  @click="upResult( scope.row)" v-if="scope.$index">上移 </el-button>
                  <el-button size="mini" type="success"  @click="downResult( scope.row)" v-if="scope.$index!==props.row.resultList.length-1">下移 </el-button>
                  <el-tag type="info" size="medium" slot="reference">更多操作</el-tag>
                </el-popover>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column label="事件类型" width="180">
        <template slot-scope="scope">
          {{ getSourceMapping(eventSourceList,scope.row.source) }}
        </template>
      </el-table-column>
      <el-table-column label="事件内容">
        <template slot-scope="scope">
          {{ scope.row.content}}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" @click="editShowEvent( scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDisableEvent(scope.row)"
                     v-if="scope.row.useYn==='Y'">禁用
          </el-button>
          <el-button size="mini" type="warning" @click="handleEnableEvent(scope.row)"
                     v-if="scope.row.useYn!=='Y'">启用
          </el-button>
          <el-button size="mini" type="info" @click="addResultShow(scope.row)">添加事件选项</el-button>
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

    <!--event-->
    <el-dialog :title='formEvent.id?"Edit Event":"New Event"' :visible.sync="dialogVisibleInputEvent" width="50%">
      <el-form label-width="100px" :model="formEvent" :rules="ruleEvent" ref="formEvent">
        <el-form-item label="事件类型:" prop="source">
          <el-select v-model="formEvent.source">
            <el-option v-for="item in eventSourceList"
                       :key="item.value"
                       :label="item.text"
                       :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="事件内容:" prop="content">
          <el-input type="textarea" :autosize="{ minRows: 4, maxRows: 6}" v-model.number="formEvent.content"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleEditEvent" v-if="formEvent.id">修改</el-button>
        <el-button type="primary" @click="handleAddEvent" v-if="!formEvent.id">添加</el-button>

        <el-button @click="dialogVisibleInputEvent=false">取 消</el-button>
      </div>
    </el-dialog>

    <!--result-->
    <el-dialog :title='formResult.id?"Edit Result":"New Result"' :visible.sync="dialogVisibleInputResult" width="50%">
      <el-form label-width="100px" :model="formResult" :rules="ruleResult" ref="formResult">
        <el-form-item label="事件选项:" prop="resultText">
          <el-input type="text" v-model.number="formResult.resultText"></el-input>
        </el-form-item>
        <el-form-item label="结果描述:" prop="content">
          <el-input type="textarea" :autosize="{ minRows: 4, maxRows: 6}" v-model.number="formResult.content"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleFormResult" v-if="!formResult.id">添加</el-button>
        <el-button type="primary" @click="handleEditResult" v-else>修改</el-button>
        <el-button @click="dialogVisibleInputResult=false">取 消</el-button>
      </div>
    </el-dialog>



    <!--Effect-->
    <el-dialog :title='formEffect.id?"Edit Effect":"New Effect"' :visible.sync="dialogVisibleInputEffect" width="30%">
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
        <el-form-item label="是否百分比:">
          <el-radio v-model="formEffect.percent" label="Y">是</el-radio>
          <el-radio v-model="formEffect.percent" label="N">否</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormEffect" v-if="!formEffect.id">确定</el-button>
        <el-button type="primary" @click="handleEditEffect" v-else>修改</el-button>
        <el-button @click="dialogVisibleInputEffect=false">取 消</el-button>
      </div>
    </el-dialog>

    <!--require-->
    <el-dialog :title='formRequire.id?"Edit Require":"New Require"' :visible.sync="dialogVisibleInputRequire" width="30%">
      <el-form label-width="100px" :model="formRequire" :rules="ruleRequire" ref="formRequire">
        <el-form-item label="限制:" prop="compare">
          <el-select v-model="formRequire.compare">
            <el-option
                    v-for="item in compareList"
                    :key="item.value"
                    :label="item.text"
                    :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="属性:" prop="attrKey">
          <el-select v-model="formRequire.attrKey">
            <el-option
                    v-for="item in attrKeys"
                    :key="item.value"
                    :label="item.text"
                    :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="值:" prop="value">
          <el-input type="text" v-model.number="formRequire.value"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormRequire" >确定</el-button>
        <el-button @click="dialogVisibleInputRequire=false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {editEvent, enableEvent, disableEvent, list, getOperation, getAttr,getCompare,getEventSource,add} from '@/api/event'
  import {addResult, editResult, enableResult, disableResult, upResult, downResult} from '@/api/event'
  import {addEffect, editEffect, deleteEffect,clearRequire,setRequire} from '@/api/event'

  export default {
    name: "event",
    data () {
      return {
        gender:1,
        dialogVisibleInputEvent: false,
        dialogVisibleListEvent: false,
        listLoadingEvent: false,
        listEvent: null,
        paramsEvent: {
          start: 0,
          limit: 10,
          source:'PLAN',
          gender:null,
          keyword:null
        },
        pageObj:{},
        formEvent: {
          content: null,
          source:null,
          add:null,
          id: null
        },
        ruleEvent: {
          source: [
            {required: true, message: 'Required field,please select ', trigger: 'blur'}
          ],
          content: [
            {required: true, message: 'Required field,please entry ', trigger: 'blur'}
          ]
        },
        dialogVisibleInputResult:false,
        formResult:{
          eventId:null,
          resultText:null,
          content:null,
          id:null
        },
        ruleResult: {
          content: [
            {required: true, message: 'Required field,please entry ', trigger: 'blur'}
          ],
          resultText: [
            {required: true, message: 'Required field,please entry ', trigger: 'blur'}
          ]
        },
        existAttr:[],
        attrKeys:[],
        operations:[],
        dialogVisibleInputEffect:false,
        formEffect:{
          resultId:null,
          operation:null,
          attrKey:null,
          value:null,
          percent:'N',
          id:null
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
        dialogVisibleInputRequire:false,
        compareList:[],
        formRequire:{
          resultId:null,
          compare:null,
          attrKey:null,
          value:null
        },
        ruleRequire:{
          compare: [
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
        eventSourceList:[]
      }
    },
    methods: {
      getSourceMapping(array,value){
        if(this.eventSourceList.length){
          const item=this.eventSourceList.find((i)=>{
            return i.value===value
          })
          if(item){
            return item.text
          }
        }
        return value
      },
      getRequire(array,row){
        return row.value?this.getAttrMapping(array,row.attrKey)+' '+row.compare +' '+row.value:'无'
      },
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
            return item.text==='增加'?'+':item.text==='减少'?'-':item.text
          }
        }
        return value==='增加'?'+':value==='减少'?'-':value
      },
      query(){
        this.paramsEvent.start = 0
        this.fetchDataEvent()
      },
      sizeChange (val) {
        this.paramsEvent.start = 0
        this.paramsEvent.limit = val
        this.fetchDataEvent()
      },
      pageChange (val) {
        this.paramsEvent.start = (val - 1) * this.pageObj['everyPage']
        this.fetchDataEvent()
      },
      fetchDataEvent () {
        this.paramsEvent.gender=this.gender
        this.listLoadingEvent = true
        list(this.paramsEvent).then(({data}) => {
          if (data['errorCode'] === 0) {
            this.listEvent = data['list']
            this.pageObj = data['pageObj']||{}
            this.paramsEvent.start = this.pageObj['nextIndex']
            this.paramsEvent.limit = this.pageObj['everyPage']
          }
          this.listLoadingEvent = false
        })
      },
      dialogShow(){
        if (this.$refs.formEvent) {
          this.$refs.formEvent.resetFields()
        }
        this.formEvent = {
          content: null,
          source:null,
          gender: this.gender,
          id: null
        }
        this.dialogVisibleInputEvent = true
      },
      resetItemResult(data,resultId){
        try {
          let _eventId = null
          const result_id = this.formResult.id || this.formRequire.resultId || resultId

          if (result_id) {
            const obj = this.listEvent.find(i => {
              const result = i.resultList.find(o => {
                return o.id === result_id
              })
              if (result) {
                return true
              }
            })
            if (obj) {
              _eventId = obj.id
            }
          }
          const eventId = this.formResult.eventId || _eventId
          if (eventId && this.listEvent && this.listEvent.length > 0) {
            this.listEvent.forEach((i) => {
              if (i.id === eventId) {
                i.resultList = data['resultList']
                throw new Error('break each')
              }
            })
          }
        } catch (e) {
        }
      },
      handleAddEvent(){
        this.$refs.formEvent.validate((valid) => {
          if (valid) {
            this.dialogVisibleInputEvent = false
            add(this.formEvent).then(({data}) => {
              if (data['errorCode'] === 0) {
                this.$message({
                  message: '保存成功',
                  type: 'success'
                })
                this.fetchDataEvent()
              } else {
                this.$message.error('保存失败')
              }
            })
          } else {
            return false
          }
        })
      },
      editShowEvent (row) {
        if (this.$refs.formEvent) {
          this.$refs.formEvent.resetFields()
        }
        this.formEvent = {
          content: row.content,
          source:row.source,
          id: row.id
        }
        this.dialogVisibleInputEvent = true
      },
      handleEditEvent () {
        this.$refs.formEvent.validate((valid) => {
          if (valid) {
            this.dialogVisibleInputEvent = false
            editEvent(this.formEvent).then(({data}) => {
              if (data['errorCode'] === 0) {
                this.$message({
                  message: '保存成功',
                  type: 'success'
                })
                this.fetchDataEvent()
              } else {
                this.$message.error('保存失败')
              }
            })
          } else {
            return false
          }
        })
      },
      handleDisableEvent (row) {
        this.$confirm('确定要禁用吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          disableEvent({id:row.id}).then(({data}) => {
            if (data['errorCode'] === 0) {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
              this.fetchDataEvent()
            } else {
              this.$message.error('操作失败')
            }
          })
        }).catch(error => {
        })
      },
      handleEnableEvent (row) {
        this.$confirm('确定要启用吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          enableEvent({id:row.id}).then(({data}) => {
            if (data['errorCode'] === 0) {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
              this.fetchDataEvent()
            } else {
              this.$message.error('操作失败')
            }
          })
        }).catch(error => {
        })
      },
      addResultShow(row){
        if (this.$refs.formResult) {
          this.$refs.formResult.resetFields()
        }
        this.formResult = {
          eventId: row.id,
          resultText: null,
          content: null,
          id: null
        }
        this.dialogVisibleInputResult = true
      },
      handleFormResult(){
        this.$refs.formResult.validate((valid) => {
          if (valid) {
            this.dialogVisibleInputResult = false
            addResult(this.formResult).then(({data}) => {
              if (data['errorCode'] === 0) {
                this.$message({
                  message: '保存成功',
                  type: 'success'
                })
                this.resetItemResult(data)
              } else {
                this.$message.error('保存失败')
              }
            })
          } else {
            return false
          }
        })
      },
      editShowResult(row){
        if (this.$refs.formResult) {
          this.$refs.formResult.resetFields()
        }
        this.formResult = {
          eventId: null,
          resultText: row.resultText,
          content: row.content,
          id: row.id
        }
        this.dialogVisibleInputResult = true
      },
      handleEditResult(){
        this.$refs.formResult.validate((valid) => {
          if (valid) {
            this.dialogVisibleInputResult = false
            editResult(this.formResult).then(({data}) => {
              if (data['errorCode'] === 0) {
                this.$message({
                  message: '保存成功',
                  type: 'success'
                })
                this.resetItemResult(data)
              } else {
                this.$message.error('保存失败')
              }
            })
          } else {
            return false
          }
        })
      },
      handleDisableResult({id}){
        this.$confirm('确定要禁用吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          disableResult({resultId:id}).then(({data}) => {
            if (data['errorCode'] === 0) {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
              this.resetItemResult(data,id)
            } else {
              this.$message.error('操作失败')
            }
          })
        }).catch(error => {
        })
      },
      handleEnableResult({id}){
        this.$confirm('确定要启用吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          enableResult({resultId:id}).then(({data}) => {
            if (data['errorCode'] === 0) {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
              this.resetItemResult(data,id)
            } else {
              this.$message.error('操作失败')
            }
          })
        }).catch(error => {
        })
      },
      upResult ({id}) {
        this.$confirm('确定要上移吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          upResult({resultId:id}).then(({data})=>{
            if (data['errorCode'] === 0) {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
              this.resetItemResult(data,id)
            } else {
              this.$message.error('操作失败')
            }
          })
        }).catch(error=>{})
      },
      downResult ({id}) {
        this.$confirm('确定要下移吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          downResult({resultId:id}).then(({data})=>{
            if (data['errorCode'] === 0) {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
              this.resetItemResult(data,id)
            } else {
              this.$message.error('操作失败')
            }
          })
        }).catch(error=>{})
      },
      dialogShowEffect (row) {
        if (this.$refs.formEffect) {
          this.$refs.formEffect.resetFields()
        }
        this.formEffect = {
          resultId:row.id,
          operation:null,
          attrKey:null,
          value:null,
          percent:'N',
          id:null
        }
        this.dialogVisibleInputEffect = true
        this.existAttr=[]
        const siblings=row.effectList
        if(siblings.length){
          siblings.forEach((i)=>{
            this.existAttr.push(i.attrKey)
          })
        }
      },
      resetItemEffectList(data,effectId){
        try {
          let _resultId = null
          const effect_Id = this.formEffect.id || effectId
          if (effect_Id) {
            this.listEvent.forEach(i => {
              i.resultList.forEach(o => {
                o.effectList.forEach(u => {
                  if (u.id === effect_Id) {
                    o['effectList'] = data['effectList']
                    throw new Error('break effectList forEach')
                  }
                })
              })
            })
          } else {
            const resultId = this.formEffect.resultId || _resultId
            if (resultId && this.listEvent && this.listEvent.length > 0) {
              this.listEvent.forEach(i => {
                i.resultList.forEach(o => {
                  if (o.id === resultId) {
                    o['effectList'] = data['effectList']
                    throw new Error('break resultList  forEach')
                  }
                })
              })
            }
          }
        } catch (e) {
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
                this.resetItemEffectList(data)
              } else {
                this.$message.error('保存失败')
              }
            })
          } else {
            return false
          }
        })
      },
      editShowEffect(siblings,row){
        if (this.$refs.formEffect) {
          this.$refs.formEffect.resetFields()
        }
        this.formEffect = {
          resultId:row.resultId.id,
          operation:row.operation,
          attrKey:row.attrKey,
          value:row.value,
          percent:row.percent,
          id:row.id
        }
        this.dialogVisibleInputEffect = true
        this.existAttr=[]
        if(siblings && siblings.length){
          siblings.forEach((i)=>{
            if(row.id !==i.id){
              this.existAttr.push(i.attrKey)
            }
          })
        }
      },
      handleEditEffect () {
        this.$refs.formEffect.validate((valid) => {
          if (valid) {
            this.dialogVisibleInputEffect = false
            editEffect(this.formEffect).then(({data}) => {
              if (data['errorCode'] === 0) {
                this.$message({
                  message: '保存成功',
                  type: 'success'
                })
                this.resetItemEffectList(data)
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
              this.resetItemEffectList(data,id)
            } else {
              this.$message.error('操作失败')
            }
          })
        }).catch(error=>{})
      },
      dialogShowRequire({id}){
        if (this.$refs.formRequire) {
          this.$refs.formRequire.resetFields()
        }
        this.formRequire = {
          resultId:id,
          compare:null,
          attrKey:null,
          value:null
        }
        this.dialogVisibleInputRequire = true
      },
      clearRequire({id}){
        this.$confirm('确定要清除吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          clearRequire({resultId:id}).then(({data})=>{
            if (data['errorCode'] === 0) {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
              this.resetItemResult(data,id)
            } else {
              this.$message.error('操作失败')
            }
          })
        }).catch(error=>{})
      },
      submitFormRequire(){
        this.$refs.formRequire.validate((valid) => {
          if (valid) {
            this.dialogVisibleInputRequire = false
            setRequire(this.formRequire).then(({data}) => {
              if (data['errorCode'] === 0) {
                this.$message({
                  message: '保存成功',
                  type: 'success'
                })
                this.resetItemResult(data)
              } else {
                this.$message.error('保存失败')
              }
            })
          } else {
            return false
          }
        })
      },
      init(){
        //attr
        if(!this.attrKeys|| !this.attrKeys.length){
          getAttr(this.gender).then(({data}) => {
            if (data['errorCode'] === 0) {
              this.attrKeys =  data['list']
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

        //compareList
        if (!this.compareList.length) {
          getCompare().then(({data}) => {
            if (data['errorCode'] === 0) {
              this.compareList = data['list']
            }
          })
        }

        //eventSourceList
        if(!this.eventSourceList.length){
          getEventSource(this.gender).then(({data})=>{
            if (data['errorCode'] === 0) {
              this.eventSourceList = data['list']
            }
          })
        }
        this.fetchDataEvent()
      }
    },
    created(){
      this.init()
    },
    computed:{
      fragment(){
        return this.$route.params.type+'Id'
      },
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
    watch:{
      '$router'(){
        this.init()
      }
    }
  }
</script>
