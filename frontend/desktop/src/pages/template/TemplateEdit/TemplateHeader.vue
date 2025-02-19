/**
* Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community
* Edition) available.
* Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
* Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* http://opensource.org/licenses/MIT
* Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
* an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
* specific language governing permissions and limitations under the License.
*/
<template>
    <page-header class="template-header-wrapper">
        <div class="header-left-area">
            <i class="bk-icon icon-arrows-left back-icon" @click="onBackClick"></i>
            <div class="title">{{ isEditProcessPage ? title : $t('编辑执行方案') }}</div>
            <h3 v-bk-overflow-tips class="template-name">{{ name }}</h3>
            <span v-if="!isViewMode && isEditProcessPage" class="common-icon-edit" @click="$emit('onChangePanel', 'templateConfigTab')"></span>
            <!-- 执行方案图标 -->
            <span
                v-if="!isViewMode && isEditProcessPage"
                class="common-icon-file-setting execute-scheme-icon"
                v-bk-tooltips.bottom="$t('执行方案')"
                @click="handleGoMangeScheme">
            </span>
        </div>
        <div class="header-right-area" slot="expand">
            <div class="button-area" v-if="isEditProcessPage">
                <div class="setting-tab-wrap">
                    <template v-for="tab in settingTabs">
                        <span
                            v-if="!(isViewMode && tab.id === 'tplSnapshootTab')"
                            :key="tab.id"
                            :class="['setting-item', {
                                'active': activeTab === tab.id,
                                'update': tab.id === 'globalVariableTab' && isGlobalVariableUpdate
                            }]"
                            @click="$emit('onChangePanel', tab.id)">
                            <i :class="tab.icon" v-bk-tooltips.bottom="tab.title"></i>
                        </span>
                    </template>
                </div>
                <bk-button
                    v-if="isViewMode && !isProjectCommonTemp"
                    theme="primary"
                    :class="['task-btn', {
                        'btn-permission-disable': !editBtnActive
                    }]"
                    v-cursor="{ active: !editBtnActive }"
                    data-test-id="templateEdit_form_editCanvas"
                    @click.stop="onEditClick">
                    {{$t('编辑')}}
                </bk-button>
                <bk-button
                    v-else-if="!isProjectCommonTemp"
                    theme="primary"
                    :class="[
                        'save-canvas',
                        'task-btn',
                        { 'btn-permission-disable': !saveBtnActive }]"
                    :loading="templateSaving"
                    v-cursor="{ active: !saveBtnActive }"
                    data-test-id="templateEdit_form_saveCanvas"
                    @click.stop="onSaveClick(false)">
                    {{$t('保存')}}
                </bk-button>
                <bk-button
                    :theme="isViewMode ? 'default' : 'primary'"
                    :class="['task-btn', {
                        'btn-permission-disable': !createTaskBtnActive
                    }]"
                    :loading="createTaskSaving"
                    v-cursor="{ active: !createTaskBtnActive }"
                    data-test-id="templateEdit_form_createTask"
                    @click.stop="onSaveClick(true)">
                    {{createTaskBtnText}}
                </bk-button>
                <bk-button
                    :class="['task-btn']"
                    data-test-id="templateEdit_form_exportCanvas"
                    @click.stop="onDownloadCanvas">
                    {{$t('导出为图片')}}
                </bk-button>
            </div>
            <div class="button-area preview" data-test-id="templateEdit_form_closePreview" v-if="!isEditProcessPage && isPreviewMode">
                <bk-button theme="primary" @click="onClosePreview">{{ $t('关闭预览') }}</bk-button>
            </div>
        </div>
        <SelectProjectModal
            :title="$t('创建任务')"
            :show="isSelectProjectShow"
            :confirm-loading="commonTplCreateTaskPermLoading || templateSaving"
            :confirm-cursor="['new', 'clone'].includes(type) ? false : !hasCommonTplCreateTaskPerm"
            @onChange="handleProjectChange"
            @onConfirm="handleCreateTaskConfirm"
            @onCancel="handleCreateTaskCancel">
        </SelectProjectModal>
    </page-header>
</template>
<script>
    import i18n from '@/config/i18n/index.js'
    import { mapState, mapActions } from 'vuex'
    import permission from '@/mixins/permission.js'
    import PageHeader from '@/components/layout/PageHeader.vue'
    import SelectProjectModal from '@/components/common/modal/SelectProjectModal.vue'
    import SETTING_TABS from './SettingTabs.js'

    export default {
        name: 'TemplateHeader',
        components: {
            PageHeader,
            SelectProjectModal
        },
        mixins: [permission],
        props: {
            type: String,
            name: String,
            template_id: [String, Number],
            project_id: [String, Number],
            common: String,
            templateSaving: Boolean,
            createTaskSaving: Boolean,
            activeTab: String,
            isGlobalVariableUpdate: Boolean,
            isTemplateDataChanged: Boolean,
            isEditProcessPage: Boolean,
            isPreviewMode: Boolean,
            tplActions: {
                type: Array,
                default () {
                    return []
                }
            }
        },
        data () {
            return {
                settingTabs: SETTING_TABS.slice(0),
                isSelectProjectShow: false, // 是否显示项目选择弹窗
                editBtnActive: false, // 编辑按钮是否激活
                saveBtnActive: false, // 保存按钮是否激活.
                saveAndCreate: true, // 是否为保存并新建
                createTaskBtnActive: false, // 新建任务按钮是否激活
                hasCreateCommonTplPerm: false, // 创建公共流程权限
                hasCommonTplCreateTaskPerm: false, // 公共流程在项目下创建任务权限
                createCommonTplPermLoading: false,
                commonTplCreateTaskPermLoading: false,
                selectedProject: {} // 公共流程创建任务所选择的项目
            }
        },
        computed: {
            ...mapState({
                'locations': state => state.template.location,
                'permissionMeta': state => state.permissionMeta
            }),
            ...mapState('project', {
                'authActions': state => state.authActions,
                'projectName': state => state.projectName
            }),
            title () {
                return this.isViewMode ? i18n.t('查看流程') : this.$route.query.template_id === undefined ? i18n.t('新建流程') : i18n.t('编辑流程')
            },
            isSaveAndCreateTaskType () {
                return this.isTemplateDataChanged === true || this.type === 'new' || this.type === 'clone'
            },
            createTaskBtnText () {
                return !this.isViewMode ? i18n.t('保存并新建任务') : i18n.t('新建任务')
            },
            saveRequiredPerm () {
                if (['new', 'clone'].includes(this.type)) {
                    return this.common ? ['common_flow_create'] : ['flow_create'] // 新建、克隆流程保存按钮对公共流程和普通流程的权限要求
                } else {
                    return this.common ? ['common_flow_edit'] : ['flow_edit']
                }
            },
            saveAndCreateRequiredPerm () {
                if (['new', 'clone'].includes(this.type)) {
                    return this.common ? ['common_flow_create'] : ['flow_create']
                } else {
                    if (this.isTemplateDataChanged) {
                        return this.common ? ['common_flow_edit'] : ['flow_edit', 'flow_create_task']
                    } else {
                        return this.common ? [] : ['flow_create_task']
                    }
                }
            },
            isViewMode () {
                return this.type === 'view'
            },
            isProjectCommonTemp () {
                const { name } = this.$route
                return name === 'projectCommonTemplatePanel'
            }
        },
        watch: {
            type (val, oldVal) {
                if (['new', 'clone'].includes(oldVal) && val === 'view' && this.common && this.isSelectProjectShow) {
                    this.queryCommonTplCreateTaskPerm().then(() => {
                        if (this.hasCommonTplCreateTaskPerm) {
                            this.saveTemplate(true)
                        }
                    })
                }
                if (val === 'view') {
                    this.setEditBtnPerm()
                }
            }
        },
        async mounted () {
            // 新建、克隆公共流程需要查询创建公共流程权限
            if (this.common) {
                await this.queryCreateCommonTplPerm()
            }
            this.setEditBtnPerm()
            this.setSaveBtnPerm()
            this.setCreateTaskBtnPerm()
        },
        methods: {
            ...mapActions([
                'queryUserPermission'
            ]),
            // 编辑流程
            onEditClick () {
                const curPermission = [...this.authActions, ...this.tplActions]
                const applyPermission = this.common ? ['common_flow_edit'] : ['flow_edit']
                if (!this.hasPermission(applyPermission, curPermission)) {
                    const permissionData = {
                        project: [{
                            id: this.project_id,
                            name: this.projectName
                        }]
                    }
                    permissionData[this.common ? 'common_flow' : 'flow'] = [{
                        id: this.template_id,
                        name: this.name
                    }]
                    this.applyForPermission(applyPermission, curPermission, permissionData)
                    return
                }
                const { params, query, name } = this.$route
                this.$router.push({
                    name,
                    params: { ...params, type: 'edit' },
                    query
                })
            },
            /**
             * 保存按钮，新建/保存并新建任务按钮点击
             * @param {Boolean} saveAndCreate 是否为新建/保存并新建任务按钮
             */
            onSaveClick (saveAndCreate = false) {
                if (this.createCommonTplPermLoading || this.commonTplCreateTaskPermLoading) {
                    return
                }
                this.saveAndCreate = saveAndCreate

                if (saveAndCreate) {
                    if (this.createTaskBtnActive) {
                        // 普通任务直接走模板校验、保存逻辑，公共流程先走模板校验、保存逻辑，然后显示项目选择弹窗
                        this.saveTemplate(saveAndCreate)
                    } else {
                        this.applyTplPerm(this.saveAndCreateRequiredPerm)
                    }
                } else {
                    if (this.saveBtnActive) {
                        this.saveTemplate(saveAndCreate)
                    } else {
                        this.applyTplPerm(this.saveRequiredPerm)
                    }
                }
            },
            onDownloadCanvas () {
                this.$emit('onDownloadCanvas')
            },
            saveTemplate (saveAndCreate = false) {
                this.$validator.validateAll().then((result) => {
                    if (!result) return
                    const pid = this.common ? this.selectedProject.id : this.project_id // 公共流程创建任务需要跳转到所选业务
                    if (saveAndCreate && !this.isSaveAndCreateTaskType) {
                        if (this.common && pid === undefined) {
                            this.setProjectSelectDialogShow()
                        } else {
                            this.goTaskCreate(pid)
                        }
                    } else {
                        this.$emit('onSaveTemplate', saveAndCreate, pid)
                    }
                })
            },
            getPermissionData () {
                let resourceData, actions
                if (['new', 'clone'].includes(this.type)) {
                    resourceData = {
                        id: this.project_id,
                        name: i18n.t('项目'),
                        auth_actions: this.authActions
                    }
                    actions = this.authActions
                } else {
                    resourceData = {
                        id: this.template_id,
                        name: this.name,
                        auth_actions: this.tplActions
                    }
                    actions = this.tplActions
                }
                return { resourceData, actions }
            },
            // 返回按钮点击
            onBackClick () {
                if (this.isEditProcessPage) {
                    this.goBackTplList()
                } else {
                    this.goBackToTplEdit()
                }
            },
            goBackTplList () {
                if (this.isTemplateDataChanged && this.type === 'edit') {
                    this.$emit('goBackViewMode') // 编辑态下返回上一个路由时先保存再back
                } else if (window.history.length <= 1) {
                    const { name } = this.$route
                    const url = name === 'projectCommonTemplatePanel'
                        ? { name: 'processCommon', params: { project_id: this.project_id } }
                        : this.common
                            ? { name: 'commonProcessList' }
                            : { name: 'processHome', params: { project_id: this.project_id } }
                    this.$router.push(url)
                } else if (this.$parent.isRouterPush) {
                    this.$router.go(-2)
                } else {
                    this.$router.back() // 由模板页跳转进入需要保留分页参数
                }
            },
            goBackToTplEdit () {
                this.$emit('goBackToTplEdit')
            },
            goTaskCreate (pid) {
                this.$router.push({
                    name: 'taskCreate',
                    params: { step: 'selectnode', project_id: pid },
                    query: {
                        template_id: this.template_id,
                        common: this.common || undefined,
                        entrance: this.isViewMode ? 'templateView' : 'templateEdit',
                        fromName: this.$route.name
                    }
                })
            },
            onClosePreview () {
                this.$emit('onClosePreview')
            },
            handleProjectChange (project) {
                this.selectedProject = project
                // 公共流程已经被创建，则需要查询是否有公共流程创建任务权限
                if (this.type !== 'new' && this.type !== 'clone') {
                    this.queryCommonTplCreateTaskPerm()
                }
            },
            /**
             * 公共流程选择业务创建任务
             * 若公共流程还没有被创建，则先创建任务，再查询是否有公共流程创建任务权限
             */
            handleCreateTaskConfirm () {
                if (this.type === 'new' || this.type === 'clone') {
                    const pid = this.common ? this.selectedProject.id : this.project_id // 公共流程创建任务需要跳转到所选业务
                    this.$emit('onSaveTemplate', false, pid)
                } else if (this.hasCommonTplCreateTaskPerm) {
                    this.saveTemplate(true)
                } else {
                    this.applyCommonTplCreateTaskPerm()
                }
            },
            handleCreateTaskCancel () {
                this.selectedProject = {}
                this.isSelectProjectShow = false
            },
            setSaveBtnPerm () {
                if (this.common && ['new', 'clone'].includes(this.type)) {
                    this.saveBtnActive = this.hasCreateCommonTplPerm
                } else {
                    const actions = [...this.authActions, ...this.tplActions]
                    this.saveBtnActive = this.hasPermission(this.saveRequiredPerm, actions)
                }
            },
            setCreateTaskBtnPerm () {
                if (this.common && ['new', 'clone'].includes(this.type)) {
                    this.createTaskBtnActive = this.hasCreateCommonTplPerm
                } else {
                    const actions = [...this.authActions, ...this.tplActions]
                    this.createTaskBtnActive = this.hasPermission(this.saveAndCreateRequiredPerm, actions)
                }
            },
            setEditBtnPerm () {
                const actions = [...this.authActions, ...this.tplActions]
                const editRequirePerm = this.common ? ['common_flow_edit'] : ['flow_edit']
                this.editBtnActive = this.hasPermission(editRequirePerm, actions)
            },
            // 查询创建公共流程权限
            async queryCreateCommonTplPerm () {
                try {
                    this.createCommonTplPermLoading = true
                    const res = await this.queryUserPermission({
                        action: 'common_flow_create'
                    })
                    this.hasCreateCommonTplPerm = res.data.is_allow
                } catch (e) {
                    console.log(e)
                } finally {
                    this.createCommonTplPermLoading = false
                }
            },
            // 查询公共流程在项目下的创建任务权限
            async queryCommonTplCreateTaskPerm () {
                try {
                    this.commonTplCreateTaskPermLoading = true
                    const bkSops = this.permissionMeta.system.find(item => item.id === 'bk_sops')
                    const res = await this.queryUserPermission({
                        action: 'common_flow_create_task',
                        resources: [
                            {
                                system: bkSops.id,
                                type: 'project',
                                id: this.selectedProject.id,
                                attributes: {}
                            },
                            {
                                system: bkSops.id,
                                type: 'common_flow',
                                id: this.template_id,
                                attributes: {}
                            }
                        ]
                    })
                    this.hasCommonTplCreateTaskPerm = res.data.is_allow
                } catch (e) {
                    console.log(e)
                } finally {
                    this.commonTplCreateTaskPermLoading = false
                }
            },
            // 打开项目选择弹窗
            setProjectSelectDialogShow () {
                this.isSelectProjectShow = true
            },
            applyCommonTplCreateTaskPerm () {
                const curPermission = [...this.tplActions, ...this.selectedProject.auth_actions]
                const resourceData = {
                    common_flow: [{
                        id: this.template_id,
                        name: this.name
                    }],
                    project: [{
                        id: this.selectedProject.id,
                        name: this.selectedProject.name
                    }]
                }
                this.applyForPermission(['common_flow_create_task'], curPermission, resourceData)
            },
            // 申请流程模板创建或编辑权限
            applyTplPerm (requiredPerm) {
                let curPermission = [...this.authActions]
                const resourceData = {}
                if (this.common) {
                    if (['view', 'edit'].includes(this.type)) { // 公共流程编辑权限
                        curPermission = [...this.tplActions]
                        resourceData.common_flow = [{
                            id: this.template_id,
                            name: this.name
                        }]
                    }
                } else {
                    resourceData.project = [{
                        id: this.project_id,
                        name: this.projectName
                    }]
                    if (['view', 'edit'].includes(this.type)) { // 普通流程编辑权限
                        curPermission = [...this.tplActions]
                        resourceData.flow = [{
                            id: this.template_id,
                            name: this.name
                        }]
                    }
                }
                this.applyForPermission(requiredPerm, curPermission, resourceData)
            },
            handleGoMangeScheme () {
                this.saveTemplate()
                this.$emit('handleGoMangeScheme', true)
            }
        }
    }
</script>
<style lang="scss" scoped>
    .template-header-wrapper {
        display: flex;
        justify-content: space-between;
        padding: 0 20px 0 10px;
        .header-left-area {
            flex: 1;
            display: flex;
            align-items: center;
            .back-icon {
                font-size: 28px;
                color: #3a84ff;
                cursor: pointer;
            }
            .title {
                font-size: 14px;
                color: #313238;
            }
        }
        .header-right-area {
            display: flex;
            align-items: center;
            height: 100%;
        }
        .template-name {
            margin: 0 0 0 20px;
            max-width: 300px;
            font-size: 14px;
            font-weight: normal;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: #63656e;
        }
        .execution-scheme-tip {
            font-size: 12px;
            color: #63656e;
            margin-left: 12px;
        }
        .common-icon-edit {
            margin-left: 10px;
            font-size: 16px;
            color: #979ba5;
            cursor: pointer;
            &:hover {
                color: #3480ff;
            }
        }
        .execute-scheme-icon {
            margin-left: 20px;
            font-size: 14px;
            color: #979ba5;
            cursor: pointer;
            &:hover {
                color: #3480ff;
            }
        }
        .setting-tab-wrap {
            display: inline-block;
            margin-right: 20px;
            padding-right: 24px;
            height: 32px;
            line-height: 32px;
            border-right: 1px solid #dcdee5;
            .setting-item {
                position: relative;
                margin-right: 20px;
                font-size: 16px;
                color: #546a9e;
                cursor: pointer;
                &:hover,
                &.active {
                    color: #3a84ff;
                }
                &:last-child {
                    margin-right: 0;
                }
                &.update::before {
                    content: '';
                    position: absolute;
                    right: -6px;
                    top: -6px;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #ff5757;
                }
            }
        }
        .task-btn {
            margin-left: 10px;
        }
    }
</style>
